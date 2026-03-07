import React, { useState, useEffect } from 'react';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, Download, Mail, Trash2, Trash } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/login/backend/api';

export default function Billing() {
    const [mesReferencia, setMesReferencia] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    });
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
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
        <div className="min-h-screen bg-white pb-24">
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
                        <Plus size={24} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleExportExcel}
                        disabled={exporting || loading}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F5] text-gray-700 hover:bg-gray-200 transition-colors font-medium rounded-full text-sm disabled:opacity-40"
                    >
                        <Download size={14} /> {exporting ? 'Exportando...' : 'Excel'}
                    </button>
                    <button
                        onClick={handleSendEmail}
                        disabled={sendingEmail || loading}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F5] text-gray-700 hover:bg-gray-200 transition-colors font-medium rounded-full text-sm disabled:opacity-40"
                    >
                        <Mail size={14} /> {sendingEmail ? 'Enviando...' : 'Email'}
                    </button>
                    <button
                        onClick={handleDeleteMes}
                        disabled={faturas.length === 0}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium rounded-full text-sm disabled:opacity-40"
                    >
                        <Trash size={14} /> Limpar
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="px-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">
                            Mes de Referencia
                        </label>
                        <input
                            type="month"
                            value={mesReferencia}
                            onChange={(e) => setMesReferencia(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">
                            Obra {obras.length > 0 && <span className="text-xs text-gray-500">({obras.length} obras)</span>}
                        </label>
                        <select
                            value={obraId}
                            onChange={(e) => setObraId(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CE0201] font-medium text-base appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23CE0201' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 12px center',
                                backgroundSize: '20px',
                                paddingRight: '40px'
                            }}
                        >
                            <option value="all" className="font-semibold">📋 Todas las obras</option>
                            {obras.length === 0 ? (
                                <option disabled>Nenhuma obra cadastrada</option>
                            ) : (
                                obras.map(obra => (
                                    <option key={obra.id} value={obra.id} className="font-medium">
                                        {obra.numero} — {obra.nome}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
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
                <div className="px-4">
                    <div className="bg-[#F5F5F5] rounded-2xl p-12 text-center">
                        <p className="text-gray-600 text-base">Cargando...</p>
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
                                                    <Trash2 size={14} />
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
