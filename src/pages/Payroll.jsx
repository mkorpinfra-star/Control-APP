import React, { useState, useEffect } from 'react';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, Download, Mail, Printer, Trash2, Trash } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/login/backend/api';

export default function Payroll() {
    const [mesReferencia, setMesReferencia] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    });
    const [obraId, setObraId] = useState('all');
    const [obras, setObras] = useState([]);
    const [folhas, setFolhas] = useState([]);
    const [totais, setTotais] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [toast, setToast] = useState(null);

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
        fetchFolhas();
    }, [mesReferencia, obraId]);

    const fetchObras = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/obras/list.php`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            console.log('📊 Payroll - Obras recebidas:', data);
            if (data.success) {
                setObras(data.obras || []);
                console.log('📊 Payroll - Total de obras:', data.obras?.length || 0);
            } else {
                console.error('❌ Payroll - Erro ao buscar obras:', data.message);
            }
        } catch (error) {
            console.error('❌ Payroll - Error fetching obras:', error);
        }
    };

    const fetchFolhas = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = `${API_URL}/payroll/list.php?mes=${mesReferencia}&obra_id=${obraId}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setFolhas(data.folhas || []);
                setTotais(data.totais || null);
            }
        } catch (error) {
            console.error('Error fetching payroll:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Generar Folha de Pagamento',
            message: '¿Generar/actualizar folha de pagamento para este mes?',
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
            const url = `${API_URL}/payroll/generate-monthly.php?mes=${mesReferencia}&obra_id=${obraId}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setToast({ message: `Folha generada!\nNuevos: ${data.gerados}\nActualizados: ${data.atualizados}`, type: 'success' });
                fetchFolhas();
            } else {
                setToast({ message: 'Error: ' + data.message, type: 'error' });
            }
        } catch (error) {
            console.error('Error generating payroll:', error);
            setToast({ message: 'Error al generar folha', type: 'error' });
        } finally {
            setLoading(false);
            setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
    };

    const handleEdit = (folha) => {
        setEditingId(folha.id);
        setEditValues({
            salario_base: folha.salario_base,
            salario_hora: folha.salario_hora,
            vale_moradia: folha.vale_moradia,
            ibf: folha.ibf
        });
    };

    const handleSave = async (id) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/payroll/update.php`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, ...editValues })
            });
            const data = await response.json();
            if (data.success) {
                setEditingId(null);
                fetchFolhas();
            } else {
                setToast({ message: 'Error: ' + data.message, type: 'error' });
            }
        } catch (error) {
            console.error('Error updating payroll:', error);
            setToast({ message: 'Error al actualizar', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValues({});
    };

    const handleExportCSV = () => {
        const token = localStorage.getItem('token');
        const url = `${API_URL}/payroll/export.php?mes=${mesReferencia}&obra_id=${obraId}&formato=csv`;
        // Trigger download via hidden link
        const a = document.createElement('a');
        a.href = url + `&_token=${encodeURIComponent(token)}`;
        a.download = `folha_${mesReferencia}.csv`;
        // Use fetch to include Authorization header
        fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(r => r.blob())
            .then(blob => {
                const objectUrl = URL.createObjectURL(blob);
                a.href = objectUrl;
                a.click();
                URL.revokeObjectURL(objectUrl);
            })
            .catch(() => setToast({ message: 'Erro ao exportar CSV', type: 'error' }));
    };

    const handleExportPDF = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/payroll/export.php?mes=${mesReferencia}&obra_id=${obraId}&formato=pdf`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.html) {
                const win = window.open('', '_blank');
                win.document.write(data.html);
                win.document.close();
                win.focus();
                setTimeout(() => win.print(), 500);
            } else {
                setToast({ message: 'Erro ao gerar PDF', type: 'error' });
            }
        } catch {
            setToast({ message: 'Erro ao gerar PDF', type: 'error' });
        }
    };

    const handleSendEmail = async () => {
        const email = prompt('Enviar folha para o email:');
        if (!email) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/payroll/export.php?mes=${mesReferencia}&obra_id=${obraId}&formato=email&email=${encodeURIComponent(email)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.email_enviado) {
                setToast({ message: `✅ Folha enviada para ${data.email_destino}`, type: 'success' });
            } else {
                setToast({ message: 'Erro ao enviar email: ' + (data.message || ''), type: 'error' });
            }
        } catch {
            setToast({ message: 'Erro ao enviar email', type: 'error' });
        }
    };

    const handleDeleteRow = (id, nome) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Eliminar Registro',
            message: `¿Deletar registro de ${nome}?`,
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
            const res = await fetch(`${API_URL}/payroll/delete.php`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.success) {
                setToast({ message: data.message, type: 'success' });
                fetchFolhas();
            } else {
                setToast({ message: 'Erro: ' + data.message, type: 'error' });
            }
        } catch {
            setToast({ message: 'Erro ao deletar', type: 'error' });
        } finally {
            setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
        }
    };

    const handleDeleteMes = () => {
        setConfirmDialog({
            isOpen: true,
            title: '⚠️ Eliminar Folha Completa',
            message: `¿Apagar TODA a folha do mês ${mesReferencia}? Esta ação não pode ser desfeita.`,
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
            const res = await fetch(`${API_URL}/payroll/delete.php`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ mes: mesReferencia })
            });
            const data = await res.json();
            if (data.success) {
                setToast({ message: data.message, type: 'success' });
                fetchFolhas();
            } else {
                setToast({ message: 'Erro: ' + data.message, type: 'error' });
            }
        } catch {
            setToast({ message: 'Erro ao deletar', type: 'error' });
        } finally {
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

    // Agrupar folhas por obra para tabela resumo
    const getObrasSummary = () => {
        if (obraId !== 'all' || folhas.length === 0) return [];

        const obraMap = {};
        folhas.forEach(folha => {
            const obraKey = folha.obra_id || 'sem_obra';
            if (!obraMap[obraKey]) {
                obraMap[obraKey] = {
                    obra_id: folha.obra_id,
                    obra_numero: folha.obra_numero,
                    obra_nome: folha.obra_nome,
                    total_custo: 0,
                    total_liquido: 0,
                    funcionarios: 0
                };
            }
            obraMap[obraKey].total_custo += parseFloat(folha.custo_total_empresa || 0);
            obraMap[obraKey].total_liquido += parseFloat(folha.total_liquido || folha.liquido_a_pagar || 0);
            obraMap[obraKey].funcionarios += 1;
        });

        return Object.values(obraMap).sort((a, b) => b.total_custo - a.total_custo);
    };

    return (
        <div className="min-h-screen bg-white pb-24">
            <div className="px-4 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Folha de Pagamento</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Gestión de nóminas</p>
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
                        onClick={handleExportCSV}
                        disabled={folhas.length === 0}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F5] text-gray-700 hover:bg-gray-200 transition-colors font-medium rounded-full text-sm disabled:opacity-40"
                    >
                        <Download size={14} /> CSV
                    </button>
                    <button
                        onClick={handleExportPDF}
                        disabled={folhas.length === 0}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F5] text-gray-700 hover:bg-gray-200 transition-colors font-medium rounded-full text-sm disabled:opacity-40"
                    >
                        <Printer size={14} /> PDF
                    </button>
                    <button
                        onClick={handleSendEmail}
                        disabled={folhas.length === 0}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F5] text-gray-700 hover:bg-gray-200 transition-colors font-medium rounded-full text-sm disabled:opacity-40"
                    >
                        <Mail size={14} /> Email
                    </button>
                    <button
                        onClick={handleDeleteMes}
                        disabled={folhas.length === 0}
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
                            Obra
                        </label>
                        <select
                            value={obraId}
                            onChange={(e) => setObraId(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300"
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
                <div className="px-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-[#F5F5F5] rounded-2xl p-4">
                            <div className="text-sm text-gray-600 mb-1">
                                Funcionários
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {totais.total_funcionarios}
                            </div>
                        </div>
                        <div className="bg-[#F5F5F5] rounded-2xl p-4">
                            <div className="text-sm text-gray-600 mb-1">
                                Total Líquido a Pagar
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {formatCurrency(totais.total_liquido)}
                            </div>
                        </div>
                        <div className="bg-[#F5F5F5] rounded-2xl p-4">
                            <div className="text-sm text-gray-600 mb-1">
                                Custo Total Empresa
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {formatCurrency(totais.total_custo_empresa)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabela Resumo por Obra (quando "Todas las obras" está selecionado) */}
            {obraId === 'all' && !loading && folhas.length > 0 && (
                <div className="px-4 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Resumo por Obra</h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#F5F5F5]">
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900">Obra</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-900">Funcionários</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-900">Total Líquido</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-900">Custo Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getObrasSummary().map((obra, idx) => (
                                        <tr key={obra.obra_id || idx} className="border-t border-gray-200 hover:bg-[#F5F5F5] transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-gray-900 text-sm">{obra.obra_nome}</div>
                                                <div className="text-xs text-gray-600">{obra.obra_numero}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-gray-700 font-medium">{obra.funcionarios}</td>
                                            <td className="px-4 py-3 text-right text-sm text-gray-700 font-bold">{formatCurrency(obra.total_liquido)}</td>
                                            <td className="px-4 py-3 text-right text-sm text-red-700 font-black">{formatCurrency(obra.total_custo)}</td>
                                        </tr>
                                    ))}
                                    {/* Total Geral */}
                                    <tr className="border-t-2 border-gray-900 bg-gray-900">
                                        <td className="px-4 py-3 font-black text-white text-sm">TOTAL GERAL</td>
                                        <td className="px-4 py-3 text-right font-bold text-white text-sm">
                                            {getObrasSummary().reduce((sum, o) => sum + o.funcionarios, 0)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-black text-white text-sm">
                                            {formatCurrency(getObrasSummary().reduce((sum, o) => sum + o.total_liquido, 0))}
                                        </td>
                                        <td className="px-4 py-3 text-right font-black text-white text-base">
                                            {formatCurrency(getObrasSummary().reduce((sum, o) => sum + o.total_custo, 0))}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Payroll Cards */}
            {loading ? (
                <div className="px-4">
                    <div className="bg-[#F5F5F5] rounded-2xl p-12 text-center">
                        <p className="text-gray-600 text-base">Cargando...</p>
                    </div>
                </div>
            ) : folhas.length === 0 ? (
                <div className="px-4">
                    <div className="bg-[#F5F5F5] rounded-2xl p-12 text-center">
                        <p className="text-gray-600 text-base">
                            No hay datos de folha para este período.
                            <br />
                            Haga clic en "Generar Folha del Mes" para crear.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="px-4 space-y-3">
                    {folhas.map(folha => {
                        const isEditing     = editingId === folha.id;
                        const salarioBase   = parseFloat(folha.salario_base    || 0);
                        const salarioHora   = parseFloat(folha.salario_hora    || folha.salario_base_hora || 0);
                        const valeMoradia   = parseFloat(folha.vale_moradia    || 0);
                        const ibf           = parseFloat(folha.ibf             || 0);
                        const subtotalHoras = parseFloat(folha.subtotal_horas  || folha.total_bruto || 0);
                        const bonificacao   = parseFloat(folha.bonificacao     || 0);
                        const casFuncValor  = parseFloat(folha.cas_funcionario_valor || folha.cas_desconto_funcionario_valor || 0);
                        const casEmpValor   = parseFloat(folha.cas_empresa_valor    || 0);
                        const totalLiquido  = parseFloat(folha.total_liquido   || folha.liquido_a_pagar || 0);
                        const custoEmpresa  = parseFloat(folha.custo_total_empresa || 0);
                        const horasN        = parseFloat(folha.horas_normais   || 0);
                        const horasE        = parseFloat(folha.horas_extra     || 0);
                        const horasNoc      = parseFloat(folha.horas_noturna   || 0);
                        const totalHoras    = horasN + horasE + horasNoc;

                        return (
                            <div key={folha.id} className="bg-[#F5F5F5] rounded-2xl overflow-hidden">
                                {/* Header */}
                                <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white text-base">{folha.funcionario_nome}</div>
                                        <div className="text-xs text-gray-300 mt-0.5">{folha.obra_numero} — {folha.obra_nome}</div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="bg-white text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                                            {totalHoras}h
                                        </span>
                                        {isEditing ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleSave(folha.id)} className="w-8 h-8 flex items-center justify-center bg-green-600 text-white hover:bg-green-700 font-bold rounded-full text-sm">✓</button>
                                                <button onClick={handleCancel} className="w-8 h-8 flex items-center justify-center bg-gray-600 text-white hover:bg-gray-700 font-bold rounded-full text-sm">✕</button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEdit(folha)} className="px-3 py-1.5 bg-white text-gray-900 hover:bg-gray-100 font-medium rounded-full text-xs">Editar</button>
                                                <button onClick={() => handleDeleteRow(folha.id, folha.funcionario_nome)} className="w-8 h-8 flex items-center justify-center bg-red-600 text-white hover:bg-red-700 rounded-full" title="Deletar"><Trash2 size={14}/></button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {/* ── Col 1: Horas ── */}
                                    <div className="bg-white rounded-xl overflow-hidden">
                                        <div className="bg-gray-100 px-3 py-2 font-semibold text-xs text-gray-700 border-b border-gray-200">
                                            Horas Trabalhadas
                                        </div>
                                        <div className="p-3 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Hora Normal</span>
                                                <span className="font-bold text-black">{horasN}h</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Hora Extra <span className="text-xs text-gray-400">(×1.4)</span></span>
                                                <span className="font-bold text-black">{horasE}h</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Hora Noturna <span className="text-xs text-gray-400">(×1.6)</span></span>
                                                <span className="font-bold text-black">{horasNoc}h</span>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-200 pt-2">
                                                <span className="font-semibold text-gray-700">V. Hora</span>
                                                {isEditing ? (
                                                    <input type="number" step="0.01" value={editValues.salario_hora}
                                                        onChange={e => setEditValues({...editValues, salario_hora: e.target.value})}
                                                        className="w-24 px-1 py-0.5 border-2 border-purple-500 text-black text-right text-sm font-bold rounded"/>
                                                ) : (
                                                    <span className="font-bold text-gray-700">{formatCurrency(salarioHora)}/h</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between bg-gray-100 -mx-3 px-3 py-2 border-t-2 border-gray-300 mt-1">
                                                <span className="font-bold text-gray-800">Subtotal Horas</span>
                                                <span className="font-bold text-gray-700">{formatCurrency(subtotalHoras)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Col 2: Resumo de Folha ── */}
                                    <div className="bg-white rounded-xl overflow-hidden">
                                        <div className="bg-gray-900 px-3 py-2 font-semibold text-xs text-white">
                                            Resumo de Folha
                                        </div>
                                        <div className="p-3 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Salário Base</span>
                                                {isEditing ? (
                                                    <input type="number" step="0.01" value={editValues.salario_base}
                                                        onChange={e => setEditValues({...editValues, salario_base: e.target.value})}
                                                        className="w-24 px-1 py-0.5 border-2 border-purple-500 text-black text-right text-sm font-bold rounded"/>
                                                ) : (
                                                    <span className="font-bold text-black">{formatCurrency(salarioBase)}</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">V. Moradia</span>
                                                {isEditing ? (
                                                    <input type="number" step="0.01" value={editValues.vale_moradia}
                                                        onChange={e => setEditValues({...editValues, vale_moradia: e.target.value})}
                                                        className="w-24 px-1 py-0.5 border-2 border-purple-500 text-black text-right text-sm font-bold rounded"/>
                                                ) : (
                                                    <span className="font-bold text-black">{formatCurrency(valeMoradia)}</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Bonificação</span>
                                                <span className="font-bold text-black">{formatCurrency(bonificacao)}</span>
                                            </div>
                                            <div className="flex justify-between text-red-600">
                                                <span>CASS <span className="text-xs text-gray-400">(6,5% s/ base)</span></span>
                                                <span className="font-bold">− {formatCurrency(casFuncValor)}</span>
                                            </div>
                                            <div className="flex justify-between bg-gray-100 -mx-3 px-3 py-2 border-t-2 border-gray-300 mt-1">
                                                <span className="font-bold text-gray-800">Total a Pagar</span>
                                                <span className="font-bold text-gray-700 text-base">{formatCurrency(totalLiquido)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Col 3: CASS (vermelho) ── */}
                                    <div className="bg-white rounded-xl overflow-hidden">
                                        <div className="bg-red-600 px-3 py-2 font-semibold text-xs text-white">
                                            CASS — Segurança Social
                                        </div>
                                        <div className="p-3 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Base de cálculo</span>
                                                <span className="font-bold text-black">{formatCurrency(salarioBase)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">CASS Retenção <span className="text-xs">(6,5%)</span></span>
                                                <span className="font-bold text-red-600">{formatCurrency(casFuncValor)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">CASS Empresa <span className="text-xs">(15,5%)</span></span>
                                                <span className="font-bold text-red-600">{formatCurrency(casEmpValor)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Prima (bônus)</span>
                                                {isEditing ? (
                                                    <input type="number" step="0.01" value={editValues.ibf}
                                                        onChange={e => setEditValues({...editValues, ibf: e.target.value})}
                                                        className="w-24 px-1 py-0.5 border-2 border-red-400 text-black text-right text-sm font-bold rounded"/>
                                                ) : (
                                                    <span className="font-bold text-black">{formatCurrency(ibf)}</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between bg-red-50 -mx-3 px-3 py-2 border-t-2 border-red-200 mt-1">
                                                <span className="font-bold text-red-800">Custo Total Empresa</span>
                                                <span className="font-bold text-red-700 text-base">{formatCurrency(custoEmpresa)}</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Legend */}
            <div className="px-4 mt-4">
                <div className="bg-[#F5F5F5] rounded-2xl p-4">
                    <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-900 rounded"/>
                            <span className="text-gray-900 font-semibold">Resumo de Folha</span>
                            <span className="text-gray-600 text-xs">— sal. base + moradia + bonificação − CASS func.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-600 rounded"/>
                            <span className="text-gray-900 font-semibold">CASS</span>
                            <span className="text-gray-600 text-xs">— calculado apenas sobre salário base declarado</span>
                        </div>
                        <div className="ml-auto text-xs text-gray-600">
                            Extra: ×1.4 · Noturna: ×1.6 · CASS func: 6,5% · CASS empresa: 15,5%
                        </div>
                    </div>
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
