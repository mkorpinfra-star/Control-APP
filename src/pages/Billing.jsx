import React, { useState, useEffect } from 'react';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import CustomSelect from '../components/CustomSelect';
import CustomDatePicker from '../components/CustomDatePicker';
import { IconPlus, IconDownload, IconMail, IconTrash, IconCalendar } from '@tabler/icons-react';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { SkeletonStatCard, SkeletonCard } from '../components/SkeletonLoader';

const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/login/backend/api';

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
            const url = `${API_URL}/billing/list.php?mes=${mesReferencia}&obra_id=${obraId}`;
            const [response] = await Promise.all([
                fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }),
                new Promise(resolve => setTimeout(resolve, 400)) // Mínimo 400ms skeleton
            ]);
            const data = await response.json();
            if (data.success) {
                setFaturas(data.faturas || []);
                setTotais(data.totais || null);
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
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Faturamento</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Gestión de facturas</p>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-12 h-12 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg disabled:opacity-50"
                    >
                        <IconPlus stroke={1} size={24} />
                    </button>
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
                    <button
                        onClick={handleDeleteMes}
                        disabled={faturas.length === 0}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium rounded-full text-sm disabled:opacity-40"
                    >
                        <IconTrash stroke={1} size={14} /> Limpar
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
                            <div className="text-sm text-gray-600 mb-1">IGI (4.5%)</div>
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
                            No hay facturas para este período.
                            <br />
                            Haga clic en "Generar Facturas del Mes" para crear.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="px-4 mb-4">
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#F5F5F5] border-b border-gray-200">
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">Obra / Cliente</th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">Horas N</th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">Horas E</th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">Horas Noct</th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">€/h N</th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">€/h E</th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">€/h Noct</th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">Servicios</th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">IGI</th>
                                        <th className="px-3 py-3 text-left text-xs font-bold text-gray-900">TOTAL</th>
                                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {faturas.map(fatura => (
                                        <tr key={fatura.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-3 py-3">
                                                <div className="font-semibold text-sm text-gray-900">{fatura.obra_numero}</div>
                                                <div className="text-sm text-gray-600">{fatura.obra_nome}</div>
                                                {fatura.cliente_nome && (
                                                    <div className="text-xs text-gray-500 mt-0.5">Cliente: {fatura.cliente_nome}</div>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-gray-700 text-sm">{formatHours(fatura.horas_normais)}</td>
                                            <td className="px-3 py-3 text-gray-700 text-sm">{formatHours(fatura.horas_extra)}</td>
                                            <td className="px-3 py-3 text-gray-700 text-sm">{formatHours(fatura.horas_noturna)}</td>
                                            <td className="px-3 py-3 text-gray-700 text-sm">{formatCurrency(fatura.valor_hora_normal)}</td>
                                            <td className="px-3 py-3 text-gray-700 text-sm">{formatCurrency(fatura.valor_hora_extra)}</td>
                                            <td className="px-3 py-3 text-gray-700 text-sm">{formatCurrency(fatura.valor_hora_noturna)}</td>
                                            <td className="px-3 py-3 font-semibold text-gray-900 text-sm">
                                                {formatCurrency(fatura.valor_total_servicos)}
                                            </td>
                                            <td className="px-3 py-3 font-semibold text-gray-900 text-sm">
                                                {formatCurrency(fatura.igi_valor)}
                                            </td>
                                            <td className="px-3 py-3 font-bold text-gray-900 text-base">
                                                {formatCurrency(fatura.valor_total_fatura)}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <button
                                                    onClick={() => handleDeleteRow(fatura.id, fatura.obra_nome)}
                                                    className="w-8 h-8 flex items-center justify-center bg-red-600 text-white hover:bg-red-700 rounded-full mx-auto"
                                                    title="Deletar"
                                                >
                                                    <IconTrash stroke={1} size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Card */}
            <div className="px-4 mt-4">
                <div className="bg-[#F5F5F5] rounded-2xl p-5">
                    <h3 className="text-base font-semibold mb-3 text-gray-900">Sobre el Faturamento</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>Los valores de <strong>faturamento</strong> son diferentes de los valores de <strong>folha</strong></li>
                        <li>Faturamento = Lo que cobramos al cliente (con markup/ganancia)</li>
                        <li>Folha = Lo que pagamos al empleado (costo)</li>
                        <li>IGI (4.5%) se calcula automáticamente sobre el total de servicios</li>
                        <li>Configure los valores de faturamento en: <strong>Configuración → Valores de Faturamento</strong></li>
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
