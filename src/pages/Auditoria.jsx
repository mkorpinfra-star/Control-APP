import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/supabase';
import { ui } from '../lib/theme';
import { IconHistory, IconChevronLeft, IconChevronRight, IconFilter, IconUser } from '@tabler/icons-react';

const ACAO_LABEL = {
  os_criada: 'OS criada', os_editada: 'OS editada', os_cancelada: 'OS cancelada',
  os_concluida: 'OS concluída', os_status_alterado: 'OS status alterado',
  contrato_criado: 'Contrato criado', contrato_editado: 'Contrato editado', contrato_encerrado: 'Contrato encerrado',
  funcionario_criado: 'Funcionário criado', funcionario_desativado: 'Funcionário desativado', funcionario_reativado: 'Funcionário reativado',
  senha_resetada: 'Senha redefinida', estoque_entrada: 'Entrada de estoque', estoque_saida: 'Saída de estoque',
  requisicao_aprovada: 'Requisição aprovada', requisicao_rejeitada: 'Requisição rejeitada',
};
const ACAO_COR = {
  os_cancelada: '#F87171', contrato_encerrado: '#F87171', funcionario_desativado: '#F87171', requisicao_rejeitada: '#F87171', estoque_saida: '#FB8C3E',
  os_concluida: '#34D399', requisicao_aprovada: '#34D399', funcionario_reativado: '#34D399', estoque_entrada: '#34D399',
};

const ENTIDADES = [
  { v: '', l: 'Todas as entidades' },
  { v: 'ordens_servico', l: 'Ordens de serviço' },
  { v: 'contratos', l: 'Contratos' },
  { v: 'usuarios', l: 'Funcionários' },
  { v: 'almoxarifado_itens', l: 'Estoque' },
  { v: 'requisicoes', l: 'Requisições' },
];

const POR_PAGINA = 30;

export default function Auditoria() {
  const [entidade, setEntidade] = useState('');
  const [acao, setAcao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [pagina, setPagina] = useState(0);
  const [expandido, setExpandido] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['auditoria', entidade, acao, dataInicio, dataFim, pagina],
    queryFn: () => auditService.listar({ entidade: entidade || undefined, acao: acao || undefined, data_inicio: dataInicio || undefined, data_fim: dataFim || undefined, pagina, porPagina: POR_PAGINA }),
    keepPreviousData: true,
  });

  const itens = data?.itens ?? [];
  const total = data?.total ?? 0;
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  const setFiltro = (fn) => { fn(); setPagina(0); };

  return (
    <div className="pb-32 bg-[#0A0B0D] min-h-full px-4 pt-4 space-y-3">
      {/* Filtros */}
      <div className="bg-[#1A1D24] border border-[#23262E] rounded-2xl p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#6B7280]"><IconFilter size={13} /> Filtros</div>
        <div className="grid grid-cols-2 gap-2">
          <select value={entidade} onChange={e => setFiltro(() => setEntidade(e.target.value))} className={`${ui.input} h-10`}>
            {ENTIDADES.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          <select value={acao} onChange={e => setFiltro(() => setAcao(e.target.value))} className={`${ui.input} h-10`}>
            <option value="">Todas as ações</option>
            {Object.entries(ACAO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input type="date" value={dataInicio} onChange={e => setFiltro(() => setDataInicio(e.target.value))} className={`${ui.input} h-10 [color-scheme:dark]`} />
          <input type="date" value={dataFim} onChange={e => setFiltro(() => setDataFim(e.target.value))} className={`${ui.input} h-10 [color-scheme:dark]`} />
        </div>
      </div>

      <p className="text-xs text-[#6B7280]">{total} registro{total !== 1 ? 's' : ''}</p>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-[#1A1D24] rounded-2xl animate-pulse" />)}</div>
      ) : itens.length === 0 ? (
        <div className="text-center py-16 text-[#6B7280]">
          <IconHistory size={44} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum registro de auditoria</p>
        </div>
      ) : (
        <div className="space-y-2">
          {itens.map(log => {
            const cor = ACAO_COR[log.acao] || '#5B8DEF';
            const aberto = expandido === log.id;
            const temDetalhe = log.dados_antigos || log.dados_novos || log.motivo;
            return (
              <div key={log.id} className="bg-[#1A1D24] border border-[#23262E] rounded-2xl p-3">
                <button onClick={() => temDetalhe && setExpandido(aberto ? null : log.id)} className="w-full text-left flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: cor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F5F5F0]">{ACAO_LABEL[log.acao] || log.acao}</p>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-0.5">
                      <IconUser size={11} /> {log.usuario_nome || '—'}
                      {log.entidade_id && <span className="text-[#454A54]">· #{String(log.entidade_id).slice(0, 8)}</span>}
                    </div>
                    {log.motivo && <p className="text-xs text-[#FB8C3E] mt-1">Motivo: {log.motivo}</p>}
                  </div>
                  <span className="text-[10px] text-[#454A54] shrink-0 text-right">
                    {new Date(log.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}<br />
                    {new Date(log.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
                {aberto && temDetalhe && (
                  <div className="mt-2 pt-2 border-t border-[#23262E] space-y-1.5">
                    {log.dados_antigos && <pre className="text-[10px] text-[#6B7280] bg-[#0A0B0D] rounded-lg p-2 overflow-x-auto">antes: {JSON.stringify(log.dados_antigos)}</pre>}
                    {log.dados_novos && <pre className="text-[10px] text-[#A8ADB8] bg-[#0A0B0D] rounded-lg p-2 overflow-x-auto">depois: {JSON.stringify(log.dados_novos)}</pre>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {total > POR_PAGINA && (
        <div className="flex items-center justify-between pt-2">
          <button onClick={() => setPagina(p => Math.max(0, p - 1))} disabled={pagina === 0} className="flex items-center gap-1 px-3 py-2 bg-[#1A1D24] border border-[#30353F] rounded-xl text-xs text-[#A8ADB8] disabled:opacity-40">
            <IconChevronLeft size={14} /> Anterior
          </button>
          <span className="text-xs text-[#6B7280]">{pagina + 1} / {totalPaginas}</span>
          <button onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))} disabled={pagina >= totalPaginas - 1} className="flex items-center gap-1 px-3 py-2 bg-[#1A1D24] border border-[#30353F] rounded-xl text-xs text-[#A8ADB8] disabled:opacity-40">
            Próxima <IconChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
