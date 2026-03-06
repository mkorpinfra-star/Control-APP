import React, { useState, useEffect } from 'react';
import Toast from '../components/Toast';
import { FileText, Trash2, Trash } from 'lucide-react';

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
            if (data.success) {
                setObras(data.obras || []);
            }
        } catch (error) {
            console.error('Error fetching obras:', error);
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

    const handleGenerate = async () => {
        if (!confirm('¿Generar/actualizar faturamento para este mes?')) return;

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

    const handleDeleteRow = async (id, obraNome) => {
        if (!confirm(`Deletar fatura de ${obraNome}?`)) return;
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
        } catch { setToast({ message: 'Erro ao deletar', type: 'error' }); }
    };

    const handleDeleteMes = async () => {
        if (!confirm(`⚠️ Apagar TODO o faturamento do mês ${mesReferencia}?`)) return;
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
        } catch { setToast({ message: 'Erro ao deletar', type: 'error' }); }
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
            <div className="px-4 pt-4 pb-3 mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Faturamento / Facturas</h1>
            </div>
            <div className="px-4 mb-4">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleExportExcel}
                        disabled={exporting || loading}
                        className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors font-semibold rounded-lg disabled:opacity-50"
                    >
                        {exporting ? 'Exportando...' : 'Exportar Excel'}
                    </button>
                    <button
                        onClick={handleSendEmail}
                        disabled={sendingEmail || loading}
                        className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors font-semibold rounded-lg disabled:opacity-50"
                    >
                        {sendingEmail ? 'Enviando...' : 'Enviar Email'}
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold rounded-lg disabled:opacity-50"
                    >
                        Generar Facturas
                    </button>
                    <button
                        onClick={handleDeleteMes}
                        disabled={faturas.length === 0}
                        title="Apagar faturamento do mês"
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-700 text-white hover:bg-red-800 transition-colors font-semibold rounded-lg disabled:opacity-40"
                    >
                        <Trash size={16} /> Limpar Mês
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-black">
                            Mes de Referencia
                        </label>
                        <input
                            type="month"
                            value={mesReferencia}
                            onChange={(e) => setMesReferencia(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#CE0201] focus:outline-none text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-black">
                            Obra
                        </label>
                        <select
                            value={obraId}
                            onChange={(e) => setObraId(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-300 focus:border-[#CE0201] focus:outline-none text-black"
                        >
                            <option value="all">Todas las obras</option>
                            {obras.map(obra => (
                                <option key={obra.id} value={obra.id}>
                                    {obra.numero} - {obra.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary */}
            {totais && (
                <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                        <div>
                            <div className="text-sm text-gray-600 mb-2">Obras Facturadas</div>
                            <div className="text-3xl font-bold text-gray-900">{totais.total_obras}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 mb-2">Total Servicios</div>
                            <div className="text-3xl font-bold text-gray-900">{formatCurrency(totais.total_servicos)}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 mb-2">IGI (4.5%)</div>
                            <div className="text-3xl font-bold text-gray-900">{formatCurrency(totais.total_igi)}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 mb-2">Total a Recibir</div>
                            <div className="text-4xl font-bold text-gray-900">{formatCurrency(totais.total_faturamento)}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Billing Table */}
            {loading ? (
                <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
                    <p className="text-gray-500 text-lg">Cargando...</p>
                </div>
            ) : faturas.length === 0 ? (
                <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
                    <p className="text-gray-500 text-lg">
                        No hay facturas para este período.
                        <br />
                        Haga clic en "Generar Facturas del Mes" para crear.
                    </p>
                </div>
            ) : (
                <div className="w-full overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-300">
                                <th className="px-3 py-2 text-left text-xs font-semibold text-black">Obra / Cliente</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-black">Horas Normales</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-black">Horas Extra</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-black">Horas Nocturnas</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-black">Valor/Hora N</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-black">Valor/Hora E</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-black">Valor/Hora Noct</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-black bg-gray-100">Total Servicios</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-black bg-gray-100">IGI (4.5%)</th>
                                <th className="px-3 py-2 text-left text-sm font-bold text-black bg-gray-100">TOTAL FACTURA</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold text-black">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {faturas.map(fatura => (
                                <tr key={fatura.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                        <div className="font-bold text-sm text-black">{fatura.obra_numero}</div>
                                        <div className="text-sm text-gray-700">{fatura.obra_nome}</div>
                                        {fatura.cliente_nome && (
                                            <div className="text-xs text-gray-500 mt-1">Cliente: {fatura.cliente_nome}</div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-black">{formatHours(fatura.horas_normais)}</td>
                                    <td className="px-3 py-2 text-black">{formatHours(fatura.horas_extra)}</td>
                                    <td className="px-3 py-2 text-black">{formatHours(fatura.horas_noturna)}</td>
                                    <td className="px-3 py-2 text-black">{formatCurrency(fatura.valor_hora_normal)}</td>
                                    <td className="px-3 py-2 text-black">{formatCurrency(fatura.valor_hora_extra)}</td>
                                    <td className="px-3 py-2 text-black">{formatCurrency(fatura.valor_hora_noturna)}</td>
                                    <td className="px-3 py-2 bg-blue-50 font-semibold text-blue-700">
                                        {formatCurrency(fatura.valor_total_servicos)}
                                    </td>
                                    <td className="px-3 py-2 bg-orange-50 font-semibold text-orange-700">
                                        {formatCurrency(fatura.igi_valor)}
                                    </td>
                                    <td className="px-3 py-2 bg-green-50 font-bold text-lg text-green-700">
                                        {formatCurrency(fatura.valor_total_fatura)}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <button
                                            onClick={() => handleDeleteRow(fatura.id, fatura.obra_nome)}
                                            className="px-2 py-1 bg-red-600 text-white hover:bg-red-700 rounded"
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
            )}

            {/* Info Card */}
            <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6 mt-6">
                <h3 className="text-lg font-semibold mb-3 text-black">Sobre el Faturamento</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li>Los valores de <strong>faturamento</strong> son diferentes de los valores de <strong>folha</strong></li>
                    <li>Faturamento = Lo que cobramos al cliente (con markup/ganancia)</li>
                    <li>Folha = Lo que pagamos al empleado (costo)</li>
                    <li>IGI (4.5%) se calcula automáticamente sobre el total de servicios</li>
                    <li>Configure los valores de faturamento en: <strong>Configuración → Valores de Faturamento</strong></li>
                </ul>
            </div>

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
