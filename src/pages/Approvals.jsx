import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import SignatureCanvas from 'react-signature-canvas';
import { apontamentosService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    User, Calendar, Check, X, Trash2, Inbox, FileText, Trash,
    AlertTriangle, ChevronLeft, Building2, CheckCircle2,
    Clock3, AlertCircle, PenLine, Ban, Users
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal, ModalBody, ModalFooter } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

// ─── helpers ────────────────────────────────────────────────────────────────
const getMondayOfWeek = (date = new Date()) => {
    const d   = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
};

const formatShortDate = (s) => {
    if (!s) return '';
    const d = new Date(s + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
};

const formatDate = (s) => {
    if (!s) return '';
    const d = new Date(s + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

const calculateHourTotals = (horasDiarias) => {
    if (!horasDiarias) return { normal: 0, extra: 0, noturna: 0, total: 0 };
    let normal = 0, extra = 0, noturna = 0;
    Object.values(horasDiarias).forEach(day => {
        if (typeof day === 'object') {
            normal  += parseFloat(day.normal)  || 0;
            extra   += parseFloat(day.extra)   || 0;
            noturna += parseFloat(day.noturna) || 0;
        } else {
            normal += parseFloat(day) || 0;
        }
    });
    return { normal, extra, noturna, total: normal + extra + noturna };
};

const getDayDates = (semanaInicio) => {
    if (!semanaInicio) return {};
    const base = new Date(semanaInicio + 'T00:00:00');
    const keys = ['mon','tue','wed','thu','fri','sat'];
    const out  = {};
    keys.forEach((k, i) => {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        out[k] = d.toISOString().split('T')[0];
    });
    return out;
};

const STATUS_CFG = {
    sem_registro:         { bg:'bg-gray-100',   text:'text-gray-500',   border:'border-gray-300',   label:'Não marcou',        icon:<Ban size={12}/> },
    rascunho:             { bg:'bg-orange-50',  text:'text-orange-700', border:'border-orange-300', label:'Rascunho',          icon:<PenLine size={12}/> },
    rejeitado:            { bg:'bg-red-50',     text:'text-red-700',    border:'border-red-300',    label:'Rejeitado',         icon:<AlertCircle size={12}/> },
    enviado:              { bg:'bg-blue-50',    text:'text-blue-700',   border:'border-blue-300',   label:'Aguard. aprovação', icon:<Clock3 size={12}/> },
    aprovado_encarregado: { bg:'bg-green-50',   text:'text-green-700',  border:'border-green-300',  label:'Aprovado',          icon:<CheckCircle2 size={12}/> },
    aprovado:             { bg:'bg-green-50',   text:'text-green-700',  border:'border-green-300',  label:'Aprovado',          icon:<CheckCircle2 size={12}/> },
};

const DAYS      = ['mon','tue','wed','thu','fri','sat'];
const DAY_LABEL = { mon:'Lun', tue:'Mar', wed:'Mié', thu:'Jue', fri:'Vie', sat:'Sáb' };

// ─── HoursDetail ────────────────────────────────────────────────────────────
const HoursDetail = ({ horasDiarias, semanaInicio }) => {
    const totals   = calculateHourTotals(horasDiarias);
    const isNew    = horasDiarias && typeof Object.values(horasDiarias)[0] === 'object';
    const dayDates = getDayDates(semanaInicio);

    if (!isNew) return (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
            {DAYS.map(d => (
                <div key={d} className="text-center">
                    <div className="text-xs text-gray-500 uppercase font-semibold">{DAY_LABEL[d]}</div>
                    <div className="font-bold text-black">{horasDiarias?.[d] || 0}h</div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse text-xs bg-white rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="px-2 py-2 text-left font-semibold border-b border-gray-200">Día</th>
                        <th className="px-2 py-2 text-center font-semibold border-b border-gray-200 bg-green-50 text-green-700">Normal</th>
                        <th className="px-2 py-2 text-center font-semibold border-b border-gray-200 bg-yellow-50 text-yellow-700">Extra</th>
                        <th className="px-2 py-2 text-center font-semibold border-b border-gray-200 bg-blue-50 text-blue-700">Noct.</th>
                    </tr>
                </thead>
                <tbody>
                    {DAYS.map(d => {
                        const dd   = horasDiarias[d] || { normal:0, extra:0, noturna:0, fecha:'' };
                        const date = dd.fecha || dayDates[d] || '';
                        return (
                            <tr key={d} className="border-b border-gray-100">
                                <td className="px-2 py-2">
                                    <span className="font-semibold text-black">{DAY_LABEL[d]}</span>
                                    {date && <span className="text-xs text-blue-600 ml-1">{formatShortDate(date)}</span>}
                                </td>
                                <td className="px-2 py-2 text-center text-green-700 font-semibold">{dd.normal  || 0}h</td>
                                <td className="px-2 py-2 text-center text-yellow-700 font-semibold">{dd.extra   || 0}h</td>
                                <td className="px-2 py-2 text-center text-blue-700 font-semibold">{dd.noturna || 0}h</td>
                            </tr>
                        );
                    })}
                    <tr className="bg-gray-50 font-bold">
                        <td className="px-2 py-2">TOTAL</td>
                        <td className="px-2 py-2 text-center text-green-700">{totals.normal}h</td>
                        <td className="px-2 py-2 text-center text-yellow-700">{totals.extra}h</td>
                        <td className="px-2 py-2 text-center text-blue-700">{totals.noturna}h</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════════════
export default function Approvals() {
    const { t }    = useTranslation();
    const { user } = useAuth();
    const signatureRef = useRef(null);

    const isEncarregado = user?.role === 'encargado' || user?.tipo === 'encarregado';

    // ── dados ────────────────────────────────────────────────────────────────
    const [obras,    setObras]    = useState([]);   // obras do encarregado
    const [pending,  setPending]  = useState([]);   // apontamentos enviados
    const [situacao, setSituacao] = useState(null); // todos alocados + status
    const [loading,  setLoading]  = useState(true);
    const [loadingSit, setLoadingSit] = useState(false);

    // ── navegação (encarregado) ──────────────────────────────────────────────
    const [obraSelecionada, setObraSelecionada] = useState(null); // objeto obra
    const [semanaFiltro, setSemanaFiltro] = useState(getMondayOfWeek);

    // ── modais ───────────────────────────────────────────────────────────────
    const [selectedEntry,    setSelectedEntry]    = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal,  setShowRejectModal]  = useState(false);
    const [rejectReason,     setRejectReason]     = useState('');
    const [additionalEmail,  setAdditionalEmail]  = useState('');
    const [sendCopy,         setSendCopy]         = useState(false);
    const [processing,       setProcessing]       = useState(false);
    const [message,          setMessage]          = useState(null);

    // ── foto obrigatória removida ─────────────────────────────────────────────────────

    // admin extras
    const [generatingReport, setGeneratingReport] = useState(false);

    // Auto-refresh: refetch quando volta ao app ou reconecta
    useAutoRefresh(['approvals', 'obras'], {
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    // ── load inicial ─────────────────────────────────────────────────────────
    useEffect(() => { loadAll(); }, []);
    useEffect(() => { if (obraSelecionada) loadSituacao(obraSelecionada.id); }, [semanaFiltro, obraSelecionada]);

    const loadAll = async () => {
        setLoading(true);
        try {
            const token   = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/login/backend/api';

            // obras ativas
            const obrasRes = await fetch(`${API_URL}/obras/list.php`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const obrasData = await obrasRes.json();
            // encarregado vê só suas obras
            const minhasObras = isEncarregado
                ? (obrasData || []).filter(o => String(o.encarregado_id) === String(user?.id))
                : (obrasData || []);
            setObras(minhasObras);

            // pending
            const pendRes  = await apontamentosService.getPendingApprovals();
            setPending(pendRes.apontamentos || []);
        } catch (e) {
            setMessage({ type: 'danger', text: e.message });
        }
        setLoading(false);
    };

    const loadSituacao = async (obraId) => {
        setLoadingSit(true);
        try {
            const token   = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/login/backend/api';
            const res     = await fetch(
                `${API_URL}/apontamentos/negligentes.php?obra_id=${obraId}&semana_inicio=${semanaFiltro}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (data.success) setSituacao(data);
        } catch (e) { console.error(e); }
        setLoadingSit(false);
    };

    const refreshAfterAction = () => {
        loadAll();
        if (obraSelecionada) loadSituacao(obraSelecionada.id);
    };

    // ── pending por obra ─────────────────────────────────────────────────────
    const pendingByObra = (obraId) => pending.filter(e => String(e.obra_id) === String(obraId));

    // ── funcionários da obra atual (do situacao) ─────────────────────────────
    const funcsObra = () => {
        if (!situacao) return [];
        return [
            ...situacao.sem_registro,
            ...situacao.rascunho,
            ...situacao.rejeitado,
            ...situacao.enviado,
            ...situacao.aprovado,
        ].sort((a, b) => a.funcionario_nome.localeCompare(b.funcionario_nome));
    };

    // ── handlers ─────────────────────────────────────────────────────────────
    const openApproveModal = (entry) => { setSelectedEntry(entry); setShowApproveModal(true); };
    const openRejectModal  = (entry) => { setSelectedEntry(entry); setRejectReason(''); setShowRejectModal(true); };
    const closeModals = () => {
        setShowApproveModal(false); setShowRejectModal(false);
        setSelectedEntry(null); setRejectReason('');
    };
    const clearSignature = () => signatureRef.current?.clear();

    const handleApprove = async () => {
        if (!signatureRef.current || signatureRef.current.isEmpty()) {
            setMessage({ type: 'warning', text: t('approvals.signatureRequired') });
            return;
        }
        setProcessing(true);
        try {
            const sig     = signatureRef.current.toDataURL();
            const copiaEm = sendCopy && additionalEmail ? additionalEmail : null;
            await apontamentosService.approve(selectedEntry.id, sig, copiaEm);
            setMessage({ type: 'success', text: t('approvals.approvedSuccess') });
            closeModals();
            refreshAfterAction();
            setAdditionalEmail(''); setSendCopy(false);
        } catch (e) { setMessage({ type: 'danger', text: e.message }); }
        setProcessing(false);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            setMessage({ type: 'warning', text: t('approvals.reasonRequired') });
            return;
        }
        setProcessing(true);
        try {
            await apontamentosService.reject(selectedEntry.id, rejectReason);
            setMessage({ type: 'success', text: t('approvals.rejectedSuccess') });
            closeModals();
            refreshAfterAction();
        } catch (e) { setMessage({ type: 'danger', text: e.message }); }
        setProcessing(false);
    };

    const handleDelete = async (entry) => {
        if (!confirm(`¿Eliminar este registro de ${entry.funcionario_nome} (semana ${entry.semana_inicio})?`)) return;
        try {
            await apontamentosService.reject(entry.id, '__DELETE__');
            setMessage({ type: 'success', text: 'Registro eliminado' });
            refreshAfterAction();
        } catch (e) { setMessage({ type: 'danger', text: e.message }); }
    };

    const handleDeleteAll = async () => {
        if (!confirm('⚠️ ATENÇÃO: Apagar TODOS os apontamentos?\nEsta ação não pode ser desfeita!')) return;
        if (!confirm('Tem certeza?')) return;
        try {
            const token   = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/login/backend/api';
            const res     = await fetch(`${API_URL}/apontamentos/delete.php`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ all: true })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: `✅ ${data.deleted} apontamentos deletados` });
                refreshAfterAction();
            } else setMessage({ type: 'danger', text: 'Erro: ' + data.message });
        } catch (e) { setMessage({ type: 'danger', text: e.message }); }
    };

    const handleGenerateWeeklyReport = async (entry) => {
        setGeneratingReport(true);
        try {
            const token   = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/login/backend/api';
            const res     = await fetch(
                `${API_URL}/relatorios/gerar-semanal.php?semana_inicio=${entry.semana_inicio}&obra_id=${entry.obra_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            setMessage({
                type: data.success && data.email_enviado ? 'success' : 'warning',
                text: data.success && data.email_enviado
                    ? `✅ Relatório enviado para ${data.email_destino} (${data.total_horas}h)`
                    : `⚠️ ${data.message || 'Email não configurado'}`
            });
        } catch (e) { setMessage({ type: 'danger', text: e.message }); }
        setGeneratingReport(false);
    };

    // ── resumo por obra (para os cards da tela inicial) ──────────────────────
    const obraResumo = (obraId) => {
        const pend = pendingByObra(obraId);
        return {
            pendentes: pend.length,
        };
    };

    // ════════════════════════════════════════════════════════════════════════
    // RENDER
    // ════════════════════════════════════════════════════════════════════════
    return (
        <div className="w-full p-4 sm:p-6 bg-gray-50 min-h-screen">

            {/* ── Flash msg ── */}
            {message && (
                <div className={`mb-4 flex items-center justify-between p-4 rounded-lg border-2 ${
                    message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                    message.type === 'danger'  ? 'bg-red-50 border-red-200 text-red-800' :
                    'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}>
                    <span className="font-semibold">{message.text}</span>
                    <button onClick={() => setMessage(null)}><X size={18}/></button>
                </div>
            )}

            {loading ? (
                <div className="text-center py-20"><Loading size="lg" text={t('app.loading')}/></div>
            ) : (

            /* ══════════════════════════════════════════════════════════════
               ENCARREGADO
            ══════════════════════════════════════════════════════════════ */
            isEncarregado ? (

                obraSelecionada === null ? (
                    /* ── TELA 1: escolher obra ── */
                    <>
                        {/* Header com Badge de função */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-3">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    Obras para Aprovar
                                </h1>
                                <span className="px-3 py-1 bg-gradient-to-r from-[#CE0201] to-[#A00101] text-white text-xs font-bold rounded-full">
                                    ENCARGADO
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Selecione uma obra para ver e aprovar as horas dos funcionários
                            </p>
                        </div>

                        {/* Cards Panorâmicos */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                            <div className="bg-[#F5F5F5] rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                        <Building2 size={18} strokeWidth={2} className="text-black" />
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-black mb-1">{obras.length}</div>
                                <div className="text-xs text-gray-700 font-semibold">Obra{obras.length !== 1 ? 's' : ''}</div>
                            </div>

                            <div className="bg-[#F5F5F5] rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                        <Clock3 size={18} strokeWidth={2} className="text-black" />
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-black mb-1">{pending.length}</div>
                                <div className="text-xs text-gray-700 font-semibold">Pendente{pending.length !== 1 ? 's' : ''}</div>
                            </div>

                            <div className="bg-[#F5F5F5] rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                        <Users size={18} strokeWidth={2} className="text-black" />
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-black mb-1">
                                    {obras.reduce((sum, o) => sum + (o.funcionarios_count || 0), 0)}
                                </div>
                                <div className="text-xs text-gray-700 font-semibold">Funcionários</div>
                            </div>

                            <div className="bg-[#F5F5F5] rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                        <CheckCircle2 size={18} strokeWidth={2} className="text-black" />
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-black mb-1">
                                    {Math.round((obras.reduce((sum, o) => sum + (obraResumo(o.id).pendentes === 0 ? 1 : 0), 0) / Math.max(obras.length, 1)) * 100)}%
                                </div>
                                <div className="text-xs text-gray-700 font-semibold">Concluído</div>
                            </div>
                        </div>

                        {obras.length === 0 ? (
                            <div className="text-center py-20">
                                <Building2 size={56} className="mx-auto mb-4 text-gray-300"/>
                                <p className="text-gray-400 font-semibold">Nenhuma obra ativa atribuída a você.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {obras.map(obra => {
                                    const res  = obraResumo(obra.id);
                                    return (
                                        <button
                                            key={obra.id}
                                            onClick={() => {
                                                setObraSelecionada(obra);
                                                setSituacao(null);
                                                loadSituacao(obra.id);
                                            }}
                                            className={`text-left bg-white rounded-xl border p-4 hover:shadow-lg transition-all group ${
                                                res.pendentes > 0 ? 'border-blue-200' : 'border-gray-200'
                                            }`}
                                        >
                                            {/* Cabeçalho do card */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                        res.pendentes > 0 ? 'bg-blue-50' : 'bg-[#F5F5F5]'
                                                    }`}>
                                                        <Building2 size={18} className={res.pendentes > 0 ? 'text-blue-600' : 'text-gray-700'}/>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm leading-tight">{obra.nome}</div>
                                                        <div className="text-xs text-gray-500 font-mono mt-0.5">{obra.numero}</div>
                                                    </div>
                                                </div>
                                                {res.pendentes > 0 && (
                                                    <span className="flex-shrink-0 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                        {res.pendentes}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Cliente */}
                                            {obra.cliente_nome && (
                                                <div className="text-xs text-gray-600 mb-3 flex items-center gap-1">
                                                    <Users size={12}/>
                                                    {obra.cliente_nome}
                                                </div>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                                <span className="text-xs text-gray-600 font-semibold">
                                                    {obra.funcionarios_count || 0} funcionário{obra.funcionarios_count !== 1 ? 's' : ''}
                                                </span>
                                                <span className={`text-xs font-bold ${res.pendentes > 0 ? 'text-blue-600' : 'text-gray-400 group-hover:text-red-600'} transition-colors`}>
                                                    Ver obra →
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </>

                ) : (
                    /* ── TELA 2: dentro da obra ── */
                    <>
                        {/* Breadcrumb / voltar */}
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => { setObraSelecionada(null); setSituacao(null); }}
                                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-j2s-red font-semibold transition-colors"
                                >
                                    <ChevronLeft size={16}/> Todas as obras
                                </button>
                                <span className="text-gray-300">/</span>
                                <div>
                                    <span className="font-bold text-gray-800">{obraSelecionada.nome}</span>
                                    <span className="ml-2 text-xs text-gray-400 font-mono">{obraSelecionada.numero}</span>
                                </div>
                            </div>
                            {/* Seletor de semana */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-semibold">Semana:</span>
                                <input
                                    type="date"
                                    value={semanaFiltro}
                                    onChange={e => setSemanaFiltro(e.target.value)}
                                    className="text-xs border-2 border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-j2s-red"
                                />
                            </div>
                        </div>

                        {/* Info da obra */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#CE0201] to-[#A00101] rounded-full flex items-center justify-center flex-shrink-0">
                                    <Building2 size={18} className="text-white"/>
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">{obraSelecionada.nome}</div>
                                    {obraSelecionada.cliente_nome && (
                                        <div className="text-xs text-gray-600">{obraSelecionada.cliente_nome}</div>
                                    )}
                                </div>
                            </div>
                            {situacao && (
                                <>
                                    <div className="ml-auto flex items-center gap-3">
                                        {/* Progresso */}
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1 text-right">
                                                {situacao.contagem.aprovado}/{situacao.contagem.total_alocados} aprovados
                                            </div>
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full transition-all"
                                                    style={{
                                                        width: situacao.contagem.total_alocados > 0
                                                            ? `${Math.round((situacao.contagem.aprovado / situacao.contagem.total_alocados) * 100)}%` : '0%',
                                                        background: situacao.contagem.aprovado === situacao.contagem.total_alocados && situacao.contagem.total_alocados > 0
                                                            ? '#16a34a' : '#CE0201'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        {situacao.contagem.aprovado === situacao.contagem.total_alocados && situacao.contagem.total_alocados > 0 && (
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                                <CheckCircle2 size={13}/> Todos aprovados
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Aviso info */}
                        <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-900 font-semibold">
                                ℹ️ Como Encargado, tu aprobación se basa únicamente en las horas trabajadas. Los valores monetarios no son visibles en este nivel.
                            </p>
                        </div>

                        {loadingSit ? (
                            <div className="text-center py-16"><Loading size="lg" text="Carregando..."/></div>
                        ) : (
                            <>
                                {/* ── Alerta: quem não enviou ainda ── */}
                                {situacao && (situacao.contagem.sem_registro + situacao.contagem.rascunho) > 0 && (
                                    <div className="mb-4 flex items-start gap-2 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-sm text-amber-800">
                                        <AlertTriangle size={18} className="flex-shrink-0 mt-0.5"/>
                                        <div>
                                            <strong>Funcionários que ainda não enviaram as horas:</strong>{' '}
                                            {[...situacao.sem_registro, ...situacao.rascunho].map(f => f.funcionario_nome.split(' ')[0]).join(', ')}.
                                            <div className="text-xs mt-1 opacity-80">
                                                O email financeiro só será enviado quando <strong>todos</strong> os funcionários desta obra estiverem aprovados.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Lista de funcionários ── */}
                                <div className="grid grid-cols-1 gap-3">
                                    {funcsObra().map(f => {
                                        const cfg       = STATUS_CFG[f.status] || STATUS_CFG['sem_registro'];
                                        const pendEntry = pendingByObra(obraSelecionada.id).find(e => String(e.funcionario_id) === String(f.funcionario_id));

                                        return (
                                            <div
                                                key={f.funcionario_id}
                                                className={`bg-white rounded-xl border overflow-hidden ${cfg.border}`}
                                            >
                                                {/* Cabeçalho do funcionário */}
                                                <div className={`flex items-center justify-between px-4 py-3 ${cfg.bg}`}>
                                                    <div className="flex items-center gap-3">
                                                        {f.foto_url ? (
                                                            <img
                                                                src={`https://j2s.ad${f.foto_url}`}
                                                                alt={f.funcionario_nome}
                                                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm">
                                                                <User size={18} className="text-gray-500"/>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className={`font-bold text-sm ${cfg.text}`}>{f.funcionario_nome}</div>
                                                            <div className={`flex items-center gap-1 text-xs ${cfg.text} opacity-80`}>
                                                                {cfg.icon}
                                                                <span>{cfg.label}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Botões de ação se "enviado" */}
                                                    {pendEntry ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => openApproveModal(pendEntry)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors active:scale-95"
                                                            >
                                                                <Check size={13}/> Aprovar
                                                            </button>
                                                            <button
                                                                onClick={() => openRejectModal(pendEntry)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors active:scale-95"
                                                            >
                                                                <X size={13}/> Rejeitar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        /* badge de status */
                                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                                                            {cfg.label}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Horas — só mostra se tem apontamento enviado */}
                                                {pendEntry && (
                                                    <div className="px-4 pt-3 pb-1">
                                                        {(() => {
                                                            const tot = calculateHourTotals(pendEntry.horas_diarias);
                                                            return (
                                                                <div className="flex flex-wrap gap-2 mb-3">
                                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Normal: {tot.normal}h</span>
                                                                    {tot.extra > 0 && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">Extra: {tot.extra}h</span>}
                                                                    {tot.noturna > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Noturna: {tot.noturna}h</span>}
                                                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-bold">Total: {tot.total}h</span>
                                                                </div>
                                                            );
                                                        })()}
                                                        <HoursDetail horasDiarias={pendEntry.horas_diarias} semanaInicio={pendEntry.semana_inicio}/>
                                                    </div>
                                                )}

                                                {/* Mensagem de rejeição anterior */}
                                                {f.status === 'rejeitado' && pendEntry?.observacao_rejeicao && (
                                                    <div className="mx-4 mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                                                        <strong>Motivo da rejeição:</strong> {pendEntry.observacao_rejeicao}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {funcsObra().length === 0 && (
                                        <div className="text-center py-16 text-gray-400">
                                            <Users size={48} className="mx-auto mb-3 opacity-30"/>
                                            <p className="font-semibold">Nenhum funcionário alocado nesta obra.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )

            ) : (

            /* ══════════════════════════════════════════════════════════════
               ADMIN — visão completa (todas as obras)
            ══════════════════════════════════════════════════════════════ */
            <>
                <div className="mb-6 pb-4 border-b-2 border-gray-200 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase tracking-wide">
                            {t('approvals.titleAdmin')}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 uppercase">{t('approvals.subtitleAdmin')}</p>
                        <Badge variant="warning" className="text-xs mt-2">{t('approvals.alreadyApprovedByEncarregado')}</Badge>
                    </div>
                    <button
                        onClick={handleDeleteAll}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700 text-white hover:bg-red-800 rounded-lg text-xs font-semibold"
                    >
                        <Trash size={14}/> Limpar Todos
                    </button>
                </div>

                {pending.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <Inbox size={56} className="mx-auto mb-4 text-gray-300"/>
                        <h3 className="text-lg font-bold text-gray-600 mb-1">{t('approvals.noEntries')}</h3>
                        <p className="text-gray-400 text-sm">{t('approvals.noEntriesText')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {/* Agrupar por obra */}
                        {(() => {
                            const map = {};
                            pending.forEach(e => {
                                if (!map[e.obra_id]) map[e.obra_id] = { numero: e.obra_numero, nome: e.obra_nome, entries: [] };
                                map[e.obra_id].entries.push(e);
                            });
                            return Object.values(map).map(obra => (
                                <div key={obra.numero} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                        <Building2 size={15} className="text-gray-500"/>
                                        <span className="font-bold text-gray-700 text-sm">{obra.numero} — {obra.nome}</span>
                                        <span className="bg-j2s-red text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                                            {obra.entries.length} pendente{obra.entries.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="p-4 grid grid-cols-1 gap-3">
                                        {obra.entries.map(entry => {
                                            const totals = calculateHourTotals(entry.horas_diarias);
                                            return (
                                                <div key={entry.id} className="border border-gray-200 rounded-xl p-4">
                                                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                                                        <div>
                                                            <div className="font-bold text-gray-900">{entry.funcionario_nome}</div>
                                                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                                <Calendar size={12}/>
                                                                {formatDate(entry.semana_inicio)}
                                                                <span className="font-bold text-j2s-red">{totals.total}h</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">N: {totals.normal}h</span>
                                                            {totals.extra   > 0 && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">E: {totals.extra}h</span>}
                                                            {totals.noturna > 0 && <span className="text-xs bg-blue-100  text-blue-700  px-2 py-0.5 rounded-full font-semibold">Nt: {totals.noturna}h</span>}
                                                        </div>
                                                    </div>
                                                    <HoursDetail horasDiarias={entry.horas_diarias} semanaInicio={entry.semana_inicio}/>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <Button onClick={() => openApproveModal(entry)} variant="success"   className="flex-1 min-w-[110px]"><Check size={15}/> Aprovar</Button>
                                                        <Button onClick={() => openRejectModal(entry)}  variant="secondary" className="flex-1 min-w-[110px]"><X size={15}/> Rejeitar</Button>
                                                        <Button onClick={() => handleDelete(entry)}     variant="danger"    className="flex-1 min-w-[100px]"><Trash2 size={15}/> Eliminar</Button>
                                                        <Button onClick={() => handleGenerateWeeklyReport(entry)} disabled={generatingReport} variant="primary" className="flex-1 min-w-[110px]">
                                                            <FileText size={15}/> {generatingReport ? 'Gerando...' : 'Relatório'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                )}
            </>
            ))}

            {/* ══ Modal Aprovar ══ */}
            <Modal isOpen={showApproveModal} onClose={closeModals} className="border-2 border-green-600 max-w-2xl">
                <div className="bg-green-600 text-white px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold uppercase">{t('approvals.approveTitle')}</h2>
                    <button onClick={closeModals} className="text-white text-3xl leading-none">&times;</button>
                </div>
                <ModalBody>
                    {selectedEntry && (
                        <>
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3 mb-1">
                                    <User size={18}/>
                                    <span className="font-bold text-black">{selectedEntry.funcionario_nome}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar size={14}/>
                                    <span>{selectedEntry.obra_numero} · {formatDate(selectedEntry.semana_inicio)}</span>
                                </div>
                            </div>
                            <HoursDetail horasDiarias={selectedEntry.horas_diarias} semanaInicio={selectedEntry.semana_inicio}/>
                            {(() => {
                                const t2 = calculateHourTotals(selectedEntry.horas_diarias);
                                return (
                                    <div className="p-3 bg-gradient-to-r from-j2s-red to-j2s-red-dark rounded-lg text-white flex items-center justify-between mb-4">
                                        <span className="font-semibold">Total de horas</span>
                                        <span className="text-2xl font-bold">{t2.total}h</span>
                                    </div>
                                );
                            })()}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('approvals.signature')}</label>
                                <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                                    <SignatureCanvas
                                        ref={signatureRef}
                                        canvasProps={{
                                            width: typeof window !== 'undefined' ? Math.min(500, window.innerWidth - 80) : 500,
                                            height: 200,
                                            className: 'signature-canvas'
                                        }}
                                        penColor="#0a0a0a"
                                        backgroundColor="#f4f4f5"
                                    />
                                </div>
                                <button onClick={clearSignature} className="mt-2 flex items-center gap-2 px-3 py-1.5 text-sm border-2 border-gray-300 text-gray-700 hover:border-j2s-red hover:text-j2s-red rounded-lg transition-all">
                                    <Trash2 size={14}/> {t('approvals.clearSignature')}
                                </button>
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={sendCopy} onChange={e => setSendCopy(e.target.checked)} className="w-5 h-5 text-j2s-red border-gray-300 rounded"/>
                                    <span className="text-sm font-semibold text-black">Enviar copia a otro email</span>
                                </label>
                                {sendCopy && (
                                    <input type="email" value={additionalEmail} onChange={e => setAdditionalEmail(e.target.value)}
                                        className="mt-2 w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-j2s-red"
                                        placeholder="email@ejemplo.com"/>
                                )}
                            </div>
                        </>
                    )}
                </ModalBody>
                <ModalFooter className="bg-gray-50">
                    <Button variant="secondary" onClick={closeModals} disabled={processing}>{t('common.cancel')}</Button>
                    <Button variant="success" onClick={handleApprove} loading={processing}>
                        <Check size={18}/> {t('approvals.confirmApprove')}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* ══ Modal Rejeitar ══ */}
            <Modal isOpen={showRejectModal} onClose={closeModals} className="border-2 border-red-600">
                <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold uppercase">{t('approvals.rejectTitle')}</h2>
                    <button onClick={closeModals} className="text-white text-3xl leading-none">&times;</button>
                </div>
                <ModalBody>
                    {selectedEntry && (
                        <>
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3 mb-1">
                                    <User size={18}/>
                                    <span className="font-bold text-black">{selectedEntry.funcionario_nome}</span>
                                </div>
                                <div className="text-sm text-gray-600">{selectedEntry.obra_numero} · {formatDate(selectedEntry.semana_inicio)}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('approvals.rejectReason')}</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-j2s-red resize-none"
                                    rows={4}
                                    placeholder={t('approvals.rejectReasonPlaceholder')}
                                />
                            </div>
                        </>
                    )}
                </ModalBody>
                <ModalFooter className="bg-gray-50">
                    <Button variant="secondary" onClick={closeModals} disabled={processing}>{t('common.cancel')}</Button>
                    <Button variant="danger" onClick={handleReject} loading={processing}>
                        <X size={18}/> {t('approvals.confirmReject')}
                    </Button>
                </ModalFooter>
            </Modal>

        </div>
    );
}
