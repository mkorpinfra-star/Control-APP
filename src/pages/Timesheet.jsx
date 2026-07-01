import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pontoService, notificacoesService } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { STATUS_PONTO, ui } from '../lib/theme';
import { IconCheck, IconX, IconClock, IconLock, IconDownload, IconLoader2 } from '@tabler/icons-react';
import InputDialog from '../components/InputDialog';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function periodoMes(ano, mes) {
  const inicio = `${ano}-${String(mes + 1).padStart(2, '0')}-01`;
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();
  const fim = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
  return { inicio, fim };
}

function baixarCSV(linhas, nome) {
  const csv = linhas.map(l => l.map(c => {
    const v = c == null ? '' : String(c);
    return /[",;\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  }).join(';')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nome;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ControlePonto() {
  const { isAdmin, isSupervisor, canAprovarPonto, canFecharPonto } = useAuth();
  const queryClient = useQueryClient();

  const hoje = new Date();
  const [aba, setAba] = useState('aprovacoes'); // aprovacoes | fechamento
  const [pontoRejeitar, setPontoRejeitar] = useState(null);
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());

  const { data: registros = [], isLoading } = useQuery({
    queryKey: ['todos-ponto'],
    queryFn: () => pontoService.getTodos({ status: canAprovarPonto ? undefined : 'enviado' }),
  });

  const aprovarMut = useMutation({
    mutationFn: async (r) => {
      await pontoService.aprovar(r.id);
      await notificacoesService.criar({
        usuario_id: r.usuario_id, titulo: 'Ponto aprovado',
        mensagem: `Seu ponto de ${new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')} foi aprovado.`,
        tipo: 'info', link: '/bater-ponto',
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos-ponto'] }),
  });
  const rejeitarMut = useMutation({
    mutationFn: async ({ r, motivo }) => {
      await pontoService.rejeitar(r.id, motivo);
      await notificacoesService.criar({
        usuario_id: r.usuario_id, titulo: 'Ponto rejeitado',
        mensagem: `Ponto de ${new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')} — motivo: ${motivo}`,
        tipo: 'info', link: '/bater-ponto',
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos-ponto'] }),
  });

  // ----- Fechamento mensal -----
  const { inicio, fim } = periodoMes(ano, mes);
  const { data: pontosMes = [] } = useQuery({
    queryKey: ['ponto-mes', inicio, fim],
    queryFn: () => pontoService.getTodos({ data_inicio: inicio, data_fim: fim }),
    enabled: aba === 'fechamento' && canFecharPonto,
  });

  const resumoPorFuncionario = useMemo(() => {
    const mapa = {};
    pontosMes.forEach(p => {
      const nome = p.usuarios?.nome || '—';
      if (!mapa[nome]) mapa[nome] = { nome, normais: 0, extras: 0, dias: 0, pendentes: 0, aprovados: 0 };
      mapa[nome].normais += Number(p.horas_normais || 0);
      mapa[nome].extras += Number(p.horas_extras || 0);
      mapa[nome].dias += 1;
      if (p.status === 'enviado') mapa[nome].pendentes += 1;
      if (p.status === 'aprovado' || p.status === 'fechado') mapa[nome].aprovados += 1;
    });
    return Object.values(mapa).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [pontosMes]);

  const totalPendentes = pontosMes.filter(p => p.status === 'enviado').length;
  const totalAprovados = pontosMes.filter(p => p.status === 'aprovado').length;

  const fecharMut = useMutation({
    mutationFn: () => pontoService.fecharMes(inicio, fim),
    onSuccess: (fechados) => {
      queryClient.invalidateQueries({ queryKey: ['ponto-mes'] });
      queryClient.invalidateQueries({ queryKey: ['todos-ponto'] });
      alert(`${fechados.length} registro(s) fechados para ${MESES[mes]}/${ano}.`);
    },
    onError: (e) => alert('Erro ao fechar mês: ' + e.message),
  });

  const exportarFechamento = () => {
    const cab = ['Funcionário', 'Dias', 'Horas normais', 'Horas extras', 'Aprovados', 'Pendentes'];
    const linhas = resumoPorFuncionario.map(r => [r.nome, r.dias, r.normais.toFixed(1), r.extras.toFixed(1), r.aprovados, r.pendentes]);
    baixarCSV([cab, ...linhas], `fechamento_ponto_${MESES[mes]}_${ano}.csv`);
  };

  const fecharMes = () => {
    if (totalPendentes > 0) {
      if (!window.confirm(`Ainda há ${totalPendentes} ponto(s) pendente(s) de aprovação neste mês. Eles NÃO serão fechados. Continuar?`)) return;
    }
    if (window.confirm(`Fechar ${totalAprovados} ponto(s) aprovado(s) de ${MESES[mes]}/${ano}? Depois de fechados, ficam consolidados.`)) {
      fecharMut.mutate();
    }
  };

  return (
    <div className="pb-32 bg-[#0A0B0D] min-h-full">
      {/* Diálogo de rejeição de ponto */}
      <InputDialog
        aberto={!!pontoRejeitar}
        titulo="Rejeitar ponto"
        label="Motivo da rejeição"
        placeholder="Descreva o motivo..."
        confirmarLabel="Rejeitar"
        onClose={() => setPontoRejeitar(null)}
        onConfirmar={(motivo) => { rejeitarMut.mutate({ r: pontoRejeitar, motivo }); setPontoRejeitar(null); }}
      />

      {/* Abas (só quem fecha vê a segunda) */}
      {canFecharPonto && (
        <div className="px-4 pt-4 pb-1 flex gap-2">
          <button onClick={() => setAba('aprovacoes')} className={ui.chip(aba === 'aprovacoes')}>Aprovações</button>
          <button onClick={() => setAba('fechamento')} className={ui.chip(aba === 'fechamento')}>Fechamento mensal</button>
        </div>
      )}

      {/* ---------- ABA APROVAÇÕES ---------- */}
      {aba === 'aprovacoes' && (
        <div className="px-4 pt-3 space-y-3">
          {isLoading ? (
            [...Array(4)].map((_, i) => <div key={i} className="bg-[#1A1D24] border border-[#23262E] rounded-2xl p-4 h-24 animate-pulse" />)
          ) : registros.length === 0 ? (
            <div className="text-center py-16 text-[#6B7280]">
              <IconClock size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum registro de ponto</p>
            </div>
          ) : registros.map(r => {
            const st = STATUS_PONTO[r.status] || STATUS_PONTO.rascunho;
            return (
              <div key={r.id} className="bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-[#F5F5F0] text-sm">{r.usuarios?.nome}</p>
                    <p className="text-xs text-[#6B7280] capitalize">{r.usuarios?.cargo}</p>
                  </div>
                  <span className={st.badge}>{st.label}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#A8ADB8] mb-1">
                  <span>{new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                  {r.hora_entrada && <span>{r.hora_entrada}{r.hora_saida ? ` – ${r.hora_saida}` : ''}</span>}
                </div>
                {(r.horas_normais > 0 || r.horas_extras > 0) && (
                  <p className="text-xs text-[#6B7280]">
                    {r.horas_normais}h normais{r.horas_extras > 0 ? ` + ${r.horas_extras}h extras` : ''}
                  </p>
                )}
                {r.status === 'enviado' && canAprovarPonto && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[#23262E]">
                    <button
                      onClick={() => aprovarMut.mutate(r)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#34D399]/10 border border-[#34D399]/20 text-[#34D399] rounded-xl text-xs font-medium active:bg-[#34D399]/20"
                    >
                      <IconCheck size={14} /> Aprovar
                    </button>
                    <button
                      onClick={() => setPontoRejeitar(r)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#F87171]/10 border border-[#F87171]/20 text-[#F87171] rounded-xl text-xs font-medium active:bg-[#F87171]/20"
                    >
                      <IconX size={14} /> Rejeitar
                    </button>
                  </div>
                )}
                {r.status === 'rejeitado' && r.motivo_rejeicao && (
                  <p className="text-xs text-[#F87171] mt-2">Motivo: {r.motivo_rejeicao}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ---------- ABA FECHAMENTO MENSAL ---------- */}
      {aba === 'fechamento' && canFecharPonto && (
        <div className="px-4 pt-3 space-y-4">
          {/* Seletor de mês */}
          <div className="flex gap-2">
            <select value={mes} onChange={e => setMes(Number(e.target.value))} className={`${ui.input} flex-1`}>
              {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select value={ano} onChange={e => setAno(Number(e.target.value))} className={`${ui.input} w-28`}>
              {[hoje.getFullYear(), hoje.getFullYear() - 1].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Status do mês */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#1A1D24] rounded-2xl p-3 text-center border border-[#23262E]">
              <p className="text-xl font-bold text-[#F5F5F0] tabular-nums">{pontosMes.length}</p>
              <p className="text-[11px] text-[#6B7280]">Registros</p>
            </div>
            <div className="bg-[#1A1D24] rounded-2xl p-3 text-center border border-[#34D399]/20">
              <p className="text-xl font-bold text-[#34D399] tabular-nums">{totalAprovados}</p>
              <p className="text-[11px] text-[#6B7280]">Aprovados</p>
            </div>
            <div className="bg-[#1A1D24] rounded-2xl p-3 text-center border border-[#5B8DEF]/20">
              <p className="text-xl font-bold text-[#5B8DEF] tabular-nums">{totalPendentes}</p>
              <p className="text-[11px] text-[#6B7280]">Pendentes</p>
            </div>
          </div>

          {/* Resumo por funcionário */}
          <div className="bg-[#1A1D24] rounded-2xl border border-[#23262E] overflow-hidden">
            <p className="text-sm font-semibold text-[#F5F5F0] px-4 pt-4 pb-2">Horas por funcionário</p>
            {resumoPorFuncionario.length === 0 ? (
              <p className="text-sm text-[#6B7280] text-center py-8">Sem registros neste mês</p>
            ) : resumoPorFuncionario.map((r, i, arr) => (
              <div key={r.nome} className={`px-4 py-3 flex items-center justify-between ${i < arr.length - 1 ? 'border-b border-[#23262E]' : ''}`}>
                <div>
                  <p className="text-sm text-[#F5F5F0]">{r.nome}</p>
                  <p className="text-xs text-[#6B7280]">{r.dias} dia(s){r.pendentes > 0 ? ` · ${r.pendentes} pendente(s)` : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#F5F5F0] tabular-nums">{r.normais.toFixed(1)}h</p>
                  {r.extras > 0 && <p className="text-xs text-[#FB8C3E] tabular-nums">+{r.extras.toFixed(1)}h extras</p>}
                </div>
              </div>
            ))}
          </div>

          <button onClick={exportarFechamento} className="w-full flex items-center justify-center gap-2 py-3 border border-[#30353F] text-[#A8ADB8] rounded-2xl text-sm font-medium active:bg-[#22262F] transition-colors">
            <IconDownload size={16} /> Exportar fechamento (CSV)
          </button>

          <button
            onClick={fecharMes}
            disabled={fecharMut.isPending || totalAprovados === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#F08020] text-white rounded-2xl text-sm font-semibold active:bg-[#D86E14] transition-colors disabled:opacity-50"
          >
            {fecharMut.isPending ? <IconLoader2 size={16} className="animate-spin" /> : <IconLock size={16} />}
            Fechar {MESES[mes]}/{ano} ({totalAprovados} aprovados)
          </button>
          <p className="text-[11px] text-[#454A54] text-center">Só pontos aprovados são consolidados. Pendentes precisam ser aprovados antes.</p>
        </div>
      )}
    </div>
  );
}
