import React, { useState, useEffect } from 'react';
import Toast from '../components/Toast';
import { DollarSign, Download, FileText, Mail, Printer, Trash2, Trash } from 'lucide-react';

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
            if (data.success) {
                setObras(data.obras || []);
            }
        } catch (error) {
            console.error('Error fetching obras:', error);
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

    const handleGenerate = async () => {
        if (!confirm('¿Generar/actualizar folha de pagamento para este mes?')) return;

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

    const handleDeleteRow = async (id, nome) => {
        if (!confirm(`Deletar registro de ${nome}?`)) return;
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
        }
    };

    const handleDeleteMes = async () => {
        if (!confirm(`⚠️ Apagar TODA a folha do mês ${mesReferencia}? Esta ação não pode ser desfeita.`)) return;
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

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="w-full mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-red-600" /> Folha de Pagamento
                </h1>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold rounded-lg disabled:opacity-50"
                    >
                        Generar Folha
                    </button>
                    <button
                        onClick={handleExportCSV}
                        disabled={folhas.length === 0}
                        title="Exportar CSV"
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold rounded-lg disabled:opacity-40"
                    >
                        <Download size={16} /> CSV
                    </button>
                    <button
                        onClick={handleExportPDF}
                        disabled={folhas.length === 0}
                        title="Ver / Imprimir PDF"
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold rounded-lg disabled:opacity-40"
                    >
                        <Printer size={16} /> PDF
                    </button>
                    <button
                        onClick={handleSendEmail}
                        disabled={folhas.length === 0}
                        title="Enviar por Email"
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 text-white hover:bg-purple-700 transition-colors font-semibold rounded-lg disabled:opacity-40"
                    >
                        <Mail size={16} /> Email
                    </button>
                    <button
                        onClick={handleDeleteMes}
                        disabled={folhas.length === 0}
                        title="Apagar folha do mês selecionado"
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-red-700 text-white hover:bg-red-800 transition-colors font-semibold rounded-lg disabled:opacity-40"
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-sm text-gray-600 mb-2">
                                Funcionários
                            </div>
                            <div className="text-3xl font-bold text-blue-600">
                                {totais.total_funcionarios}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 mb-2">
                                Total Líquido a Pagar
                            </div>
                            <div className="text-3xl font-bold text-green-600">
                                {formatCurrency(totais.total_liquido)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 mb-2">
                                Custo Total Empresa
                            </div>
                            <div className="text-3xl font-bold text-orange-600">
                                {formatCurrency(totais.total_custo_empresa)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payroll Cards */}
            {loading ? (
                <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
                    <p className="text-gray-500 text-lg">Cargando...</p>
                </div>
            ) : folhas.length === 0 ? (
                <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
                    <p className="text-gray-500 text-lg">
                        No hay datos de folha para este período.
                        <br />
                        Haga clic en "Generar Folha del Mes" para crear.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
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
                            <div key={folha.id} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                {/* Header: nome amarelo igual à planilha */}
                                <div className="bg-amber-400 px-5 py-3 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-black text-base uppercase tracking-wide">{folha.funcionario_nome}</div>
                                        <div className="text-xs text-black/70 mt-0.5">{folha.obra_numero} — {folha.obra_nome}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full">
                                            TOTAL: {totalHoras}h
                                        </span>
                                        {isEditing ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleSave(folha.id)} className="px-3 py-1 bg-green-600 text-white hover:bg-green-700 font-bold rounded text-sm">✓ Salvar</button>
                                                <button onClick={handleCancel} className="px-3 py-1 bg-gray-500 text-white hover:bg-gray-600 font-bold rounded text-sm">✕</button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEdit(folha)} className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded text-xs">Editar</button>
                                                <button onClick={() => handleDeleteRow(folha.id, folha.funcionario_nome)} className="px-2 py-1 bg-red-700 text-white hover:bg-red-800 rounded" title="Deletar"><Trash2 size={14}/></button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">

                                    {/* ── Col 1: Horas ── */}
                                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                                        <div className="bg-gray-100 px-3 py-2 font-bold text-xs text-gray-600 uppercase tracking-wide border-b border-gray-200">
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
                                                    <span className="font-bold text-purple-700">{formatCurrency(salarioHora)}/h</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between bg-orange-50 -mx-3 px-3 py-2 border-t-2 border-orange-300 mt-1">
                                                <span className="font-bold text-orange-800">Subtotal Horas</span>
                                                <span className="font-bold text-orange-700">{formatCurrency(subtotalHoras)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Col 2: Resumo de Folha (roxo) ── */}
                                    <div className="border-2 border-purple-300 rounded-lg overflow-hidden">
                                        <div className="bg-purple-600 px-3 py-2 font-bold text-xs text-white uppercase tracking-wide">
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
                                            <div className="flex justify-between bg-purple-50 -mx-3 px-3 py-2 border-t-2 border-purple-300 mt-1">
                                                <span className="font-bold text-purple-800">Total a Pagar</span>
                                                <span className="font-bold text-purple-700 text-base">{formatCurrency(totalLiquido)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Col 3: CASS (vermelho) ── */}
                                    <div className="border-2 border-red-200 rounded-lg overflow-hidden">
                                        <div className="bg-red-600 px-3 py-2 font-bold text-xs text-white uppercase tracking-wide">
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
            <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-4 mt-6">
                <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-600 rounded"/>
                        <span className="text-black font-semibold">Resumo de Folha</span>
                        <span className="text-gray-500 text-xs">— sal. base + moradia + bonificação − CASS func.</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-600 rounded"/>
                        <span className="text-black font-semibold">CASS</span>
                        <span className="text-gray-500 text-xs">— calculado apenas sobre salário base declarado</span>
                    </div>
                    <div className="ml-auto text-xs text-gray-500 italic">
                        Extra: ×1.4 · Noturna: ×1.6 · CASS func: 6,5% · CASS empresa: 15,5%
                    </div>
                </div>
            </div>

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
