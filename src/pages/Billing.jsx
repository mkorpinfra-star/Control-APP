import React, { useState, useEffect } from 'react';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import CustomSelect from '../components/CustomSelect';
import CustomDatePicker from '../components/CustomDatePicker';
import { IconDownload, IconMail, IconTrash, IconCalendar } from '@tabler/icons-react';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { SkeletonStatCard, SkeletonCard } from '../components/SkeletonLoader';

const API_URL = import.meta.env.VITE_API_URL || 'https://puntotouch.nextim.io/backend/api';

export default function Billing() {
    const [mesReferencia, setMesReferencia] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    });

    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [obraId, setObraId] = useState('all');
    const [obras, setObras] = useState([]);
    const [faturas, setFaturas] = useState([]);
    const [totais, setTotais] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    // Estados para modais de confirmação
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'warning',
        confirmText: 'Confirmar',
        loading: false
    });

    // Auto-refresh: refetch quando volta ao app ou reconecta
    useAutoRefresh(['billing', 'obras'], {
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    useEffect(() => {
        fetchObras();
    }, []);

    useEffect(() => {
        fetchFaturas();
    }, [mesReferencia, obraId]);

    const fetchObras = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/obras/list.php`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            console.log('💰 Billing - Obras recebidas:', data);
            if (data.success) {
                setObras(data.obras || []);
                console.log('💰 Billing - Total de obras:', data.obras?.length || 0);
            } else {
                console.error('❌ Billing - Erro ao buscar obras:', data.message);
            }
        } catch (error) {
            console.error('❌ Billing - Error fetching obras:', error);
        }
    };

    const fetchFaturas = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Usar endpoint real-time que calcula automaticamente
            const url = `${API_URL}/billing/realtime-summary.php?mes=${mesReferencia}&obra_id=${obraId}`;
            const [response] = await Promise.all([
                fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }),
                new Promise(resolve => setTimeout(resolve, 400)) // Mínimo 400ms skeleton
            ]);
            const data = await response.json();
            if (data.success) {
                setFaturas(data.faturas || []);
                setTotais(data.totais || null);
            } else {
                // Se não tiver config, mostrar mensagem
                if (data.message) {
                    setToast({ message: data.message, type: 'warning' });
                }
            }
        } catch (error) {
            console.error('Error fetching billing:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Generar Faturamento',
            message: '¿Generar/actualizar faturamento para este mes?',
            type: 'info',
            confirmText: 'Generar',
            onConfirm: executeGenerate,
            loading: false
        });
    };

    const executeGenerate = async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = `${API_URL}/billing/generate-monthly.php?mes=${mesReferencia}&obra_id=${obraId}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setToast({ message: `Faturamento generado!\nNuevos: ${data.gerados}\nActualizados: ${data.atualizados}`, type: 'success' });
                fetchFaturas();
            } else {
                setToast({ message: 'Error: ' + data.message, type: 'error' });
            }
        } catch (error) {
            console.error('Error generating billing:', error);
            setToast({ message: 'Error al generar faturamento', type: 'error' });
        } finally {
            setLoading(false);
            setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(value || 0);
    };

    const formatHours = (value) => {
        return parseFloat(value || 0).toFixed(1) + 'h';
    };

    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('token');
            const url = `${API_URL}/billing/export-excel.php?mes=${mesReferencia}&obra_id=${obraId}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `faturamento-${mesReferencia}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(downloadUrl);
                setToast({ message: 'Excel generado correctamente', type: 'success' });
            } else {
                throw new Error('Error al generar Excel');
            }
        } catch (error) {
            console.error('Error exporting:', error);
            setToast({ message: 'Error al exportar: ' + error.message, type: 'error' });
        } finally {
            setExporting(false);
        }
    };

    const handleDeleteRow = (id, obraNome) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Eliminar Fatura',
            message: `¿Deletar fatura de ${obraNome}?`,
            type: 'danger',
            confirmText: 'Eliminar',
            onConfirm: () => executeDeleteRow(id),
            loading: false
        });
    };

    const executeDeleteRow = async (id) => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/billing/delete.php`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.success) { setToast({ message: data.message, type: 'success' }); fetchFaturas(); }
            else setToast({ message: 'Erro: ' + data.message, type: 'error' });
        } catch {
            setToast({ message: 'Erro ao deletar', type: 'error' });
        } finally {
            setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
    };

    const handleDeleteMes = () => {
        setConfirmDialog({
            isOpen: true,
            title: '⚠️ Eliminar Faturamento Completo',
            message: `¿Apagar TODO o faturamento do mês ${mesReferencia}? Esta ação não pode ser desfeita.`,
            type: 'danger',
            confirmText: 'Eliminar Todo',
            onConfirm: executeDeleteMes,
            loading: false
        });
    };

    const executeDeleteMes = async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/billing/delete.php`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ mes: mesReferencia })
            });
            const data = await res.json();
            if (data.success) { setToast({ message: data.message, type: 'success' }); fetchFaturas(); }
            else setToast({ message: 'Erro: ' + data.message, type: 'error' });
        } catch {
            setToast({ message: 'Erro ao deletar', type: 'error' });
        } finally {
            setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
    };

    const handleSendEmail = async () => {
        setSendingEmail(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/billing/send-email.php`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mes: mesReferencia, obra_id: obraId })
            });

            const result = await response.json();
            if (result.success) {
                setToast({ message: 'Email enviado correctamente a contactes@j2s.ad', type: 'success' });
            } else {
                setToast({ message: 'Error: ' + result.message, type: 'error' });
            }
        } catch (error) {
            console.error('Error sending email:', error);
            setToast({ message: 'Error al enviar email', type: 'error' });
        } finally {
            setSendingEmail(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-32">
            <div className="px-4 pt-6 pb-4">
                <div className="mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">Faturamento</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Cálculo automático em tempo real</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleExportExcel}
                        disabled={exporting || loading}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F5] text-gray-700 hover:bg-gray-200 transition-colors font-medium rounded-full text-sm disabled:opacity-40"
                    >
                        <IconDownload stroke={1} size={14} /> {exporting ? 'Exportando...' : 'Excel'}
                    </button>
                    <button
                        onClick={handleSendEmail}
                        disabled={sendingEmail || loading}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F5] text-gray-700 hover:bg-gray-200 transition-colors font-medium rounded-full text-sm disabled:opacity-40"
                    >
                        <IconMail stroke={1} size={14} /> {sendingEmail ? 'Enviando...' : 'Email'}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="px-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CustomDatePicker
                        label="Mes de Referencia"
                        selected={selectedDate}
                        onChange={(date) => {
                            setSelectedDate(date);
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            setMesReferencia(`${year}-${month}`);
                        }}
                        dateFormat="MMMM yyyy"
                        showMonthYearPicker
                        showFullMonthYearPicker
                    />
                    <CustomSelect
                        label="Obra"
                        count={obras.length}
                        value={obraId}
                        onChange={setObraId}
                        options={[
                            { value: 'all', label: 'Todas las obras' },
                            ...(obras.length === 0
                                ? [{ value: '', label: 'Nenhuma obra cadastrada', disabled: true }]
                                : obras.map(obra => ({
                                    value: obra.id,
                                    label: `${obra.numero} — ${obra.nome}`
                                }))
                            )
                        ]}
                    />
                </div>
            </div>

            {/* Summary */}
            {totais && (
                <div className="px-4 mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-[#F5F5F5] rounded-2xl p-4">
                            <div className="text-sm text-gray-600 mb-1">Obras</div>
                            <div className="text-2xl font-bold text-gray-900">{totais.total_obras}</div>
                        </div>
                        <div className="bg-[#F5F5F5] rounded-2xl p-4">
                            <div className="text-sm text-gray-600 mb-1">Servicios</div>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totais.total_servicos)}</div>
                        </div>
                        <div className="bg-[#F5F5F5] rounded-2xl p-4">
                            <div className="text-sm text-gray-600 mb-1">IGI/IVA</div>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totais.total_igi)}</div>
                        </div>
                        <div className="bg-[#F5F5F5] rounded-2xl p-4">
                            <div className="text-sm text-gray-600 mb-1">Total</div>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totais.total_faturamento)}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Billing Table */}
            {loading ? (
                <div className="px-4 space-y-3">
                    {/* Skeleton Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <SkeletonStatCard />
                        <SkeletonStatCard />
                        <SkeletonStatCard />
                        <SkeletonStatCard />
                    </div>
                    {/* Skeleton Table */}
                    <div className="bg-[#F5F5F5] rounded-2xl p-4 animate-pulse space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 bg-gray-300 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            ) : faturas.length === 0 ? (
                <div className="px-4">
                    <div className="bg-[#F5F5F5] rounded-2xl p-12 text-center">
                        <p className="text-gray-600 text-base">
                            No hay horas registradas para este período.
                            <br />
                            El faturamento se calcula automáticamente cuando los empleados registran horas.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="px-4 mb-4 space-y-3">
                    {faturas.map((fatura, index) => (
                        <div key={`${fatura.obra_id}-${index}`} className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                            {/* Header da Obra */}
                            <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-100">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                            {fatura.obra_numero}
                                        </span>
                                        <h3 className="text-base font-bold text-gray-900">{fatura.obra_nome}</h3>
                                    </div>
                                    {fatura.cliente_nome && (
                                        <p className="text-sm text-gray-600">Cliente: {fatura.cliente_nome}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 font-medium mb-0.5">TOTAL FATURAMENTO</div>
                                    <div className="text-2xl font-black text-red-600">
                                        {formatCurrency(fatura.valor_total_fatura)}
                                    </div>
                                </div>
                            </div>

                            {/* Horas Trabalhadas */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {/* Horas Normais */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
                                    <div className="text-xs font-semibold text-green-700 mb-1">⏰ Normais</div>
                                    <div className="text-xl font-bold text-green-900">{formatHours(fatura.horas_normais)}</div>
                                    <div className="text-xs text-green-600 mt-1">{formatCurrency(fatura.valor_hora_normal)}/h</div>
                                </div>

                                {/* Horas Extras */}
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-200">
                                    <div className="text-xs font-semibold text-orange-700 mb-1">⚡ Extras</div>
                                    <div className="text-xl font-bold text-orange-900">{formatHours(fatura.horas_extra)}</div>
                                    <div className="text-xs text-orange-600 mt-1">{formatCurrency(fatura.valor_hora_extra)}/h</div>
                                </div>

                                {/* Horas Noturnas */}
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-200">
                                    <div className="text-xs font-semibold text-indigo-700 mb-1">🌙 Noturnas</div>
                                    <div className="text-xl font-bold text-indigo-900">{formatHours(fatura.horas_noturna)}</div>
                                    <div className="text-xs text-indigo-600 mt-1">{formatCurrency(fatura.valor_hora_noturna)}/h</div>
                                </div>
                            </div>

                            {/* Breakdown Financeiro */}
                            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Servicios</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(fatura.valor_total_servicos)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">IGI ({fatura.igi_percentual}%)</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(fatura.igi_valor)}</span>
                                </div>
                                <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-900">TOTAL</span>
                                    <span className="text-lg font-black text-red-600">{formatCurrency(fatura.valor_total_fatura)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info Card */}
            <div className="px-4 mt-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
                    <h3 className="text-base font-semibold mb-3 text-gray-900">💡 Cálculo Automático em Tempo Real</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span>Los valores se calculan <strong>automáticamente</strong> cuando los empleados registran horas</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span>No es necesario generar manualmente - todo está <strong>siempre actualizado</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span><strong>Faturamento</strong> = Lo que cobramos al cliente (con markup/ganancia)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span><strong>Folha</strong> = Lo que pagamos al empleado (costo)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">⚙️</span>
                            <span>Configure los valores en: <strong>Configuración → Valores de Faturamento</strong></span>
                        </li>
                    </ul>
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                type={confirmDialog.type}
                confirmText={confirmDialog.confirmText}
                loading={confirmDialog.loading}
            />

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
