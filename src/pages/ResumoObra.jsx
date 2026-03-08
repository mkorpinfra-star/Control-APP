import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    IconBuilding, IconChevronDown, IconRefresh, IconDeviceFloppy, IconAlertCircle,
    IconFileText, IconTrendingUp, IconCurrencyDollar, IconCalculator
} from '@tabler/icons-react';
import CustomSelect from '../components/CustomSelect';

const API_URL = import.meta.env.VITE_API_URL || '/backend/api';

const fmt = (v) =>
    parseFloat(v || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Meses para o select
const MESES = [
    '01','02','03','04','05','06','07','08','09','10','11','12'
];
const MESES_NOME = {
    '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março',   '04': 'Abril',
    '05': 'Maio',    '06': 'Junho',     '07': 'Julho',   '08': 'Agosto',
    '09': 'Setembro','10': 'Outubro',   '11': 'Novembro','12': 'Dezembro'
};

// Campos de despesas indiretas (igual à planilha)
const DESPESAS_CAMPOS = [
    { key: 'locacao_escritorio', label: 'Locação Escritório'   },
    { key: 'locacao_deposito',   label: 'Locação Depósito'     },
    { key: 'fornecedores',       label: 'Fornecedores'         },
    { key: 'ferramentas',        label: 'Ferramentas'          },
    { key: 'uniformes',          label: 'Uniformes'            },
    { key: 'taxa_imigracao',     label: 'Taxa de Imigração'    },
    { key: 'cartao_transporte',  label: 'Cartão de Transporte' },
    { key: 'outros',             label: 'Outros'               },
];

export default function ResumoObra() {
    const { token } = useAuth();

    // ── Filtros ──────────────────────────────────────────────────────────────
    const now   = new Date();
    const [ano,    setAno]    = useState(String(now.getFullYear()));
    const [mes,    setMes]    = useState(String(now.getMonth() + 1).padStart(2, '0'));
    const [obraId, setObraId] = useState('');

    // ── Data ─────────────────────────────────────────────────────────────────
    const [obras,    setObras]    = useState([]);
    const [resumo,   setResumo]   = useState(null);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState('');

    // ── Despesas (edição inline) ─────────────────────────────────────────────
    const [despEdit,    setDespEdit]    = useState({});
    const [savingDesp,  setSavingDesp]  = useState(false);
    const [despSaved,   setDespSaved]   = useState(false);

    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Carregar obras
    useEffect(() => {
        fetch(`${API_URL}/obras/list.php`, { headers })
            .then(r => r.json())
            .then(data => {
                const list = Array.isArray(data) ? data : (data.obras || []);
                setObras(list);
                if (list.length > 0 && !obraId) setObraId(String(list[0].id));
            })
            .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Carregar resumo
    const carregarResumo = useCallback(async () => {
        if (!obraId) return;
        setLoading(true);
        setError('');
        try {
            const mesRef = `${ano}-${mes}`;
            const res = await fetch(
                `${API_URL}/payroll/resumo-obra.php?obra_id=${obraId}&mes=${mesRef}`,
                { headers }
            );
            const data = await res.json();
            if (data.success) {
                setResumo(data);
                // Preencher campos de despesas com valores existentes
                const d = data.despesas || {};
                const init = {};
                DESPESAS_CAMPOS.forEach(({ key }) => {
                    init[key] = d[key] !== undefined ? String(d[key]) : '0';
                });
                setDespEdit(init);
                setDespSaved(false);
            } else {
                setError(data.message || 'Erro ao carregar resumo');
            }
        } catch (e) {
            setError('Erro de conexão');
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [obraId, ano, mes, token]);

    useEffect(() => {
        if (obraId) carregarResumo();
    }, [obraId, ano, mes, carregarResumo]);

    // Salvar despesas
    const salvarDespesas = async () => {
        setSavingDesp(true);
        try {
            const body = { obra_id: parseInt(obraId), mes_referencia: `${ano}-${mes}` };
            DESPESAS_CAMPOS.forEach(({ key }) => {
                body[key] = parseFloat(despEdit[key] || 0);
            });
            const res  = await fetch(`${API_URL}/payroll/despesas-salvar.php`, {
                method: 'POST', headers, body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                setDespSaved(true);
                carregarResumo();
            }
        } catch {
            setError('Erro ao salvar despesas');
        } finally {
            setSavingDesp(false);
        }
    };

    // ── Anos disponíveis ─────────────────────────────────────────────────────
    const anos = [];
    for (let y = now.getFullYear() - 2; y <= now.getFullYear() + 1; y++) anos.push(String(y));

    const obraSel = obras.find(o => String(o.id) === String(obraId));

    // ── Atalhos para dados ───────────────────────────────────────────────────
    const funcionarios  = resumo?.funcionarios   || [];
    const totFolha      = resumo?.totais_folha   || {};
    const fat           = resumo?.faturamento    || {};
    const rv            = resumo?.resumo_valores || {};

    // Calcular total de despesas em tempo real (para exibir enquanto edita)
    const totalDespLive = DESPESAS_CAMPOS.reduce((s, { key }) => s + parseFloat(despEdit[key] || 0), 0);
    const totalLiqLive  = parseFloat(rv.v_fatura || 0)
                        - parseFloat(rv.igi_valor || 0)
                        - parseFloat(rv.folha_pagamento || 0)
                        - parseFloat(rv.cass_total || 0)
                        - totalDespLive;

    // ═══════════════════════════════════════════════════════════════════════
    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resumo da Obra</h1>
                    <p className="text-sm text-gray-500 mt-1">Relatório consolidado mensal — folha + faturamento + despesas</p>
                </div>
                <button
                    onClick={carregarResumo}
                    disabled={loading || !obraId}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                >
                    <IconRefresh stroke={1} size={16} className={loading ? 'animate-spin' : ''} />
                    Atualizar
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-4">
                {/* Obra */}
                <div className="flex-1 min-w-[200px]">
                    <CustomSelect
                        label="Obra"
                        value={obraId}
                        onChange={(value) => setObraId(value)}
                        options={obras.map(o => ({
                            value: o.id,
                            label: `${o.numero} — ${o.nome}`
                        }))}
                    />
                </div>

                {/* Mês */}
                <div>
                    <CustomSelect
                        label="Mês"
                        value={mes}
                        onChange={(value) => setMes(value)}
                        options={MESES.map(m => ({
                            value: m,
                            label: MESES_NOME[m]
                        }))}
                    />
                </div>

                {/* Ano */}
                <div>
                    <CustomSelect
                        label="Ano"
                        value={ano}
                        onChange={(value) => setAno(value)}
                        options={anos.map(y => ({
                            value: y,
                            label: y
                        }))}
                    />
                </div>
            </div>

            {/* Erro */}
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <IconAlertCircle stroke={1} size={16} /> {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-16 text-gray-400">
                    <IconRefresh stroke={1} size={24} className="animate-spin mr-2" /> Carregando…
                </div>
            )}

            {/* Conteúdo */}
            {!loading && resumo && (
                <div className="space-y-6">
                    {/* Info da obra */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <IconBuilding stroke={1} size={22} className="text-amber-600" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-lg">
                                {obraSel?.numero} — {obraSel?.nome}
                            </div>
                            <div className="text-sm text-gray-500">
                                Cliente: <span className="font-medium text-gray-700">{resumo.obra?.cliente_nome || '—'}</span>
                                &nbsp;·&nbsp;Ref: <span className="font-medium text-gray-700">{MESES_NOME[mes]} {ano}</span>
                            </div>
                        </div>
                    </div>

                    {/* ═══ TABELA DE FUNCIONÁRIOS (estilo planilha) ═══════════════════ */}
                    {funcionarios.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
                            Nenhuma folha gerada para este mês. Gere primeiro na página <strong>Folha de Pagamento</strong>.
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            {/* Cabeçalho da tabela — amarelo como na planilha */}
                            <div className="bg-amber-400 px-5 py-3 flex items-center gap-2">
                                <IconFileText stroke={1} size={16} className="text-amber-900" />
                                <span className="font-bold text-amber-900 text-sm uppercase tracking-wide">
                                    Funcionários — {MESES_NOME[mes]} {ano}
                                </span>
                            </div>

                            {funcionarios.map((f, idx) => {
                                const nome       = f.funcionario_nome;
                                const funcao     = f.funcionario_funcao || '—';
                                const salBase    = parseFloat(f.salario_base_declarado || f.salario_base || 0);
                                const salHora    = parseFloat(f.salario_hora_calc || 0);
                                const hNorm      = parseFloat(f.horas_normais  || 0);
                                const hExtra     = parseFloat(f.horas_extra    || 0);
                                const hNot       = parseFloat(f.horas_noturna  || 0);
                                const subtotal   = parseFloat(f.subtotal_horas_calc || 0);
                                const boni       = parseFloat(f.bonificacao_calc    || 0);
                                const prima      = parseFloat(f.prima_calc          || 0);
                                const moradia    = parseFloat(f.vale_moradia_calc   || 0);
                                const casFunc    = parseFloat(f.cas_func_valor_calc || 0);
                                const casEmp     = parseFloat(f.cas_empresa_valor_calc || 0);
                                const casFuncPc  = parseFloat(f.cas_func_perc_calc  || 6.5);
                                const casEmpPc   = parseFloat(f.cas_emp_perc_calc   || 15.5);
                                const liq        = parseFloat(f.total_liquido_calc  || 0);
                                const custoEmp   = parseFloat(f.custo_empresa_calc  || 0);

                                return (
                                    <div key={f.id || idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        {/* Nome do funcionário */}
                                        <div className="px-5 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                                            <div>
                                                <span className="font-semibold text-gray-900">{nome}</span>
                                                <span className="ml-2 text-xs text-gray-500">{funcao}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">Sal. Base: <span className="font-medium text-gray-600">{fmt(salBase)} €</span></span>
                                        </div>

                                        {/* 3 colunas */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">

                                            {/* COL 1: Horas Trabalhadas */}
                                            <div className="p-4">
                                                <div className="text-xs font-bold text-gray-500 uppercase mb-3">Horas Trabalhadas</div>
                                                <table className="w-full text-sm">
                                                    <tbody>
                                                        <tr className="border-b border-gray-100">
                                                            <td className="py-1 text-gray-600">Normais</td>
                                                            <td className="py-1 text-right font-medium">{hNorm}h</td>
                                                            <td className="py-1 text-right text-gray-400 text-xs pl-2">× {fmt(salHora)}</td>
                                                        </tr>
                                                        <tr className="border-b border-gray-100">
                                                            <td className="py-1 text-gray-600">Extra (×1,4)</td>
                                                            <td className="py-1 text-right font-medium">{hExtra}h</td>
                                                            <td className="py-1 text-right text-gray-400 text-xs pl-2">× {fmt(salHora * 1.4)}</td>
                                                        </tr>
                                                        <tr className="border-b border-gray-100">
                                                            <td className="py-1 text-gray-600">Noturna (×1,6)</td>
                                                            <td className="py-1 text-right font-medium">{hNot}h</td>
                                                            <td className="py-1 text-right text-gray-400 text-xs pl-2">× {fmt(salHora * 1.6)}</td>
                                                        </tr>
                                                        <tr className="bg-gray-50">
                                                            <td className="py-1.5 font-semibold text-gray-800">Subtotal Horas</td>
                                                            <td colSpan={2} className="py-1.5 text-right font-bold text-gray-900">{fmt(subtotal)} €</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* COL 2: Resumo de Folha */}
                                            <div className="p-4">
                                                <div className="text-xs font-bold text-purple-600 uppercase mb-3">Resumo de Folha</div>
                                                <table className="w-full text-sm">
                                                    <tbody>
                                                        <tr className="border-b border-gray-100">
                                                            <td className="py-1 text-gray-600">Subtotal Horas</td>
                                                            <td className="py-1 text-right font-medium">{fmt(subtotal)} €</td>
                                                        </tr>
                                                        <tr className="border-b border-gray-100">
                                                            <td className="py-1 text-gray-600">Prima (bônus)</td>
                                                            <td className="py-1 text-right font-medium text-green-600">{fmt(prima)} €</td>
                                                        </tr>
                                                        <tr className="border-b border-gray-100">
                                                            <td className="py-1 text-gray-600">Bonificação</td>
                                                            <td className="py-1 text-right font-medium text-green-600">{fmt(boni)} €</td>
                                                        </tr>
                                                        <tr className="border-b border-gray-100">
                                                            <td className="py-1 text-gray-600">V. Moradia</td>
                                                            <td className="py-1 text-right font-medium">{fmt(moradia)} €</td>
                                                        </tr>
                                                        <tr className="border-b border-gray-100">
                                                            <td className="py-1 text-gray-600">CASS {casFuncPc}%</td>
                                                            <td className="py-1 text-right font-medium text-red-600">−{fmt(casFunc)} €</td>
                                                        </tr>
                                                        <tr className="bg-purple-50">
                                                            <td className="py-1.5 font-semibold text-purple-800">Total a Pagar</td>
                                                            <td className="py-1.5 text-right font-bold text-purple-900">{fmt(liq)} €</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* COL 3: Resumo de CASS */}
                                            <div className="p-4">
                                                <div className="text-xs font-bold text-red-600 uppercase mb-3">Resumo de CASS</div>
                                                <table className="w-full text-sm">
                                                    <tbody>
                                                        <tr className="border-b border-gray-100">
                                                            <td className="py-1 text-gray-600">Base (Sal. Declarado)</td>
                                                            <td className="py-1 text-right font-medium">{fmt(salBase)} €</td>
                                                        </tr>
                                                        <tr className="border-b border-gray-100">
                                                            <td className="py-1 text-gray-600">Retenção {casFuncPc}% (func.)</td>
                                                            <td className="py-1 text-right font-medium text-red-600">{fmt(casFunc)} €</td>
                                                        </tr>
                                                        <tr className="border-b border-gray-100">
                                                            <td className="py-1 text-gray-600">Empresa {casEmpPc}%</td>
                                                            <td className="py-1 text-right font-medium text-red-600">{fmt(casEmp)} €</td>
                                                        </tr>
                                                        <tr className="bg-red-50">
                                                            <td className="py-1.5 font-semibold text-red-800">Custo Empresa</td>
                                                            <td className="py-1.5 text-right font-bold text-red-900">{fmt(custoEmp)} €</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Linha de Totais */}
                            <div className="bg-amber-50 border-t-2 border-amber-300">
                                <div className="px-5 py-2 bg-amber-300 text-center">
                                    <span className="font-bold text-amber-900 text-xs uppercase tracking-wide">Totais da Obra</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-amber-200 p-4 gap-2">
                                    <div className="text-sm space-y-1">
                                        <div className="flex justify-between"><span className="text-gray-600">H. Normais</span><span className="font-medium">{fmt(totFolha.total_horas_normais)}h</span></div>
                                        <div className="flex justify-between"><span className="text-gray-600">H. Extra</span><span className="font-medium">{fmt(totFolha.total_horas_extra)}h</span></div>
                                        <div className="flex justify-between"><span className="text-gray-600">H. Noturna</span><span className="font-medium">{fmt(totFolha.total_horas_noturna)}h</span></div>
                                        <div className="flex justify-between border-t border-amber-200 pt-1"><span className="font-semibold">Subtotal Horas</span><span className="font-bold">{fmt(totFolha.total_subtotal_horas)} €</span></div>
                                    </div>
                                    <div className="text-sm space-y-1 md:px-4">
                                        <div className="flex justify-between"><span className="text-gray-600">Bonificação</span><span className="font-medium text-green-700">{fmt(totFolha.total_bonificacao)} €</span></div>
                                        <div className="flex justify-between"><span className="text-gray-600">V. Moradia</span><span className="font-medium">{fmt(totFolha.total_vale_moradia)} €</span></div>
                                        <div className="flex justify-between"><span className="text-gray-600">CASS Func.</span><span className="font-medium text-red-600">−{fmt(totFolha.total_cas_funcionario)} €</span></div>
                                        <div className="flex justify-between border-t border-amber-200 pt-1"><span className="font-semibold text-purple-800">Total Líquido</span><span className="font-bold text-purple-900">{fmt(totFolha.total_liquido)} €</span></div>
                                    </div>
                                    <div className="text-sm space-y-1 md:px-4">
                                        <div className="flex justify-between"><span className="text-gray-600">CASS Empresa</span><span className="font-medium text-red-600">{fmt(totFolha.total_cas_empresa)} €</span></div>
                                        <div className="flex justify-between border-t border-amber-200 pt-1 mt-1"><span className="font-semibold text-red-800">Custo Total Empresa</span><span className="font-bold text-red-900">{fmt(totFolha.total_custo_empresa)} €</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ DESPESAS INDIRETAS ═══════════════════════════════════════════ */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-700 px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <IconCalculator stroke={1} size={16} className="text-gray-200" />
                                <span className="font-bold text-white text-sm uppercase tracking-wide">Despesas Indiretas Mensais</span>
                            </div>
                            <button
                                onClick={salvarDespesas}
                                disabled={savingDesp}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-semibold hover:bg-gray-100 disabled:opacity-50"
                            >
                                <IconDeviceFloppy stroke={1} size={13} />
                                {savingDesp ? 'Salvando…' : despSaved ? '✓ Salvo' : 'Salvar'}
                            </button>
                        </div>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {DESPESAS_CAMPOS.map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={despEdit[key] ?? '0'}
                                        onChange={e => {
                                            setDespEdit(prev => ({ ...prev, [key]: e.target.value }));
                                            setDespSaved(false);
                                        }}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="px-5 pb-4 text-right">
                            <span className="text-xs text-gray-500 mr-2">Total Despesas:</span>
                            <span className="font-bold text-gray-900 text-lg">{fmt(totalDespLive)} €</span>
                        </div>
                    </div>

                    {/* ═══ RESUMO DE VALORES (bloco final da planilha) ═════════════════ */}
                    <div className="bg-white border-2 border-orange-400 rounded-xl overflow-hidden">
                        <div className="bg-orange-400 px-5 py-3 flex items-center gap-2">
                            <IconTrendingUp stroke={1} size={16} className="text-orange-900" />
                            <span className="font-bold text-orange-900 text-sm uppercase tracking-wide">Resumo de Valores</span>
                        </div>

                        <div className="p-5 space-y-0">
                            {/* Faturas a receber */}
                            <ResumoLinha
                                label="V. Fatura (a receber)"
                                valor={rv.v_fatura || 0}
                                className="text-green-700 font-bold"
                                bg="bg-green-50"
                                borda="border-green-100"
                            />
                            <ResumoLinha
                                label={`IGI a Pagar ${rv.igi_percentual || 4.5}%`}
                                valor={rv.igi_valor || 0}
                                sinal="-"
                                className="text-orange-700"
                                bg="bg-orange-50"
                                borda="border-orange-100"
                            />
                            <ResumoLinha
                                label="Folha de Pagamento"
                                valor={rv.folha_pagamento || 0}
                                sinal="-"
                                className="text-purple-700"
                                bg="bg-purple-50"
                                borda="border-purple-100"
                            />
                            <ResumoLinha
                                label={`CASS a Pagar (${((parseFloat(rv.cass_funcionario||0)+parseFloat(rv.cass_empresa||0)) > 0 && parseFloat(rv.folha_pagamento||0) > 0 ? '22' : '22')}%)`}
                                valor={rv.cass_total || 0}
                                sinal="-"
                                className="text-red-700"
                                bg="bg-red-50"
                                borda="border-red-100"
                                sublabel={`Func. ${fmt(rv.cass_funcionario||0)} + Emp. ${fmt(rv.cass_empresa||0)}`}
                            />
                            <ResumoLinha
                                label="Despesas Indiretas"
                                valor={totalDespLive}
                                sinal="-"
                                className="text-gray-700"
                                bg="bg-gray-50"
                                borda="border-gray-100"
                            />
                            <ResumoLinha
                                label="V. Moradia"
                                valor={rv.moradia || 0}
                                className="text-blue-700"
                                bg="bg-blue-50"
                                borda="border-blue-100"
                            />

                            {/* Divisor */}
                            <div className="border-t-2 border-orange-300 my-2" />

                            {/* Total Líquido */}
                            <div className="flex items-center justify-between px-4 py-3 bg-orange-100 rounded-lg border border-orange-300">
                                <span className="font-bold text-orange-900 text-base">TOTAL LÍQUIDO</span>
                                <span className={`font-bold text-lg ${totalLiqLive >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {totalLiqLive < 0 ? '−' : ''}{fmt(Math.abs(totalLiqLive))} €
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ═══ RESUMO DE FATURAMENTO (para o cliente) ════════════════════ */}
                    {(fat.horas_normais > 0 || fat.valor_total_servicos > 0) && (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-green-600 px-5 py-3 flex items-center gap-2">
                                <IconCurrencyDollar stroke={1} size={16} className="text-white" />
                                <span className="font-bold text-white text-sm uppercase tracking-wide">Resumo da Fatura (Cliente)</span>
                            </div>
                            <div className="p-5">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-gray-500">
                                            <th className="text-left py-2">Tipo</th>
                                            <th className="text-right py-2">Horas</th>
                                            <th className="text-right py-2">V. Hora</th>
                                            <th className="text-right py-2">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-2">Normal</td>
                                            <td className="text-right">{fmt(fat.horas_normais || 0)}h</td>
                                            <td className="text-right">{fmt(fat.valor_hora_normal || 0)}</td>
                                            <td className="text-right font-medium">{fmt((fat.horas_normais||0)*(fat.valor_hora_normal||0))}</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-2">Extra</td>
                                            <td className="text-right">{fmt(fat.horas_extra || 0)}h</td>
                                            <td className="text-right">{fmt(fat.valor_hora_extra || 0)}</td>
                                            <td className="text-right font-medium">{fmt((fat.horas_extra||0)*(fat.valor_hora_extra||0))}</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-2">Noturna</td>
                                            <td className="text-right">{fmt(fat.horas_noturna || 0)}h</td>
                                            <td className="text-right">{fmt(fat.valor_hora_noturna || 0)}</td>
                                            <td className="text-right font-medium">{fmt((fat.horas_noturna||0)*(fat.valor_hora_noturna||0))}</td>
                                        </tr>
                                        <tr className="bg-green-50 font-semibold">
                                            <td colSpan={3} className="py-2 text-green-800">Total Serviços</td>
                                            <td className="text-right text-green-900">{fmt(fat.valor_total_servicos || 0)}</td>
                                        </tr>
                                        <tr className="text-orange-700">
                                            <td colSpan={3} className="py-2">IGI {fat.igi_perc || 4.5}%</td>
                                            <td className="text-right">{fmt(fat.igi_valor_calc || 0)}</td>
                                        </tr>
                                        <tr className="bg-green-100 font-bold border-t-2 border-green-300">
                                            <td colSpan={3} className="py-2.5 text-green-900">TOTAL FATURA</td>
                                            <td className="text-right text-green-900 text-base">{fmt(fat.valor_total_fatura_calc || 0)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Estado inicial / sem dados */}
            {!loading && !resumo && !error && (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                    <IconBuilding stroke={1} size={40} className="mx-auto mb-3 text-gray-300" />
                    <p>Selecione uma obra para ver o resumo</p>
                </div>
            )}
        </div>
    );
}

// Componente auxiliar para linhas do resumo de valores
function ResumoLinha({ label, valor, sinal = '', className = '', bg = '', borda = '', sublabel = '' }) {
    return (
        <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg mb-1 border ${bg} ${borda}`}>
            <div>
                <span className="text-sm font-medium text-gray-800">{label}</span>
                {sublabel && <div className="text-xs text-gray-400">{sublabel}</div>}
            </div>
            <span className={`font-semibold text-sm ${className}`}>
                {sinal}{fmt(valor)} €
            </span>
        </div>
    );
}
