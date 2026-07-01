import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requisicoesService, almoxarifadoService, ordensServicoService } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { STATUS_REQ, ui } from '../lib/theme';
import { IconPackage, IconCheck, IconX, IconPlus, IconTrash, IconLoader2 } from '@tabler/icons-react';
import Modal from '../components/Modal';

export default function Requisicoes() {
  const { isAdmin, isSupervisor, perfil } = useAuth();
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState('pendente');
  const [modalAberto, setModalAberto] = useState(false);
  const [osId, setOsId] = useState('');
  const [itens, setItens] = useState([{ item_id: '', quantidade: 1 }]);
  const [erroForm, setErroForm] = useState('');

  const { data: requisicoes = [], isLoading } = useQuery({
    queryKey: ['requisicoes', filtro],
    queryFn: () => requisicoesService.getAll({
      status: filtro || undefined,
      usuario_id: (!isAdmin && !isSupervisor) ? perfil?.id : undefined,
    }),
  });

  const { data: itensEstoque = [] } = useQuery({ queryKey: ['almoxarifado-itens'], queryFn: almoxarifadoService.getItens });
  const { data: ordens = [] } = useQuery({ queryKey: ['ordens-servico', ''], queryFn: () => ordensServicoService.getAll({}) });

  const criarMutation = useMutation({
    mutationFn: ({ dados, itens }) => requisicoesService.create(dados, itens),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisicoes'] });
      setModalAberto(false);
      setOsId(''); setItens([{ item_id: '', quantidade: 1 }]); setErroForm('');
    },
    onError: (e) => setErroForm('Erro ao criar requisição: ' + e.message),
  });

  const setItemCampo = (idx, campo, valor) => setItens(prev => prev.map((it, i) => i === idx ? { ...it, [campo]: valor } : it));
  const addItem = () => setItens(prev => [...prev, { item_id: '', quantidade: 1 }]);
  const removeItem = (idx) => setItens(prev => prev.filter((_, i) => i !== idx));

  const salvarRequisicao = () => {
    const validos = itens.filter(i => i.item_id && Number(i.quantidade) > 0);
    if (validos.length === 0) return setErroForm('Adicione ao menos um item com quantidade.');
    criarMutation.mutate({
      dados: { usuario_id: perfil.id, os_id: osId || null },
      itens: validos.map(i => ({ item_id: i.item_id, quantidade: Number(i.quantidade) })),
    });
  };

  const aprovarMutation = useMutation({
    mutationFn: requisicoesService.aprovar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requisicoes'] }),
  });
  const rejeitarMutation = useMutation({
    mutationFn: ({ id, motivo }) => requisicoesService.rejeitar(id, motivo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requisicoes'] }),
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-3 bg-[#0A0B0D] min-h-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#1A1D24] border border-[#23262E] rounded-2xl p-4 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="pb-32 bg-[#0A0B0D] min-h-full">
      <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
        {['pendente', 'aprovada', 'rejeitada', ''].map(s => (
          <button key={s} onClick={() => setFiltro(s)} className={ui.chip(filtro === s)}>
            {s === '' ? 'Todas' : STATUS_REQ[s]?.label}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3 mt-2">
        {requisicoes.length === 0 ? (
          <div className="text-center py-16 text-[#6B7280]">
            <IconPackage size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma requisição encontrada</p>
          </div>
        ) : (
          requisicoes.map(r => {
            const st = STATUS_REQ[r.status] || STATUS_REQ.pendente;
            return (
              <div key={r.id} className="bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-[#F5F5F0] text-sm">{r.usuarios?.nome}</p>
                    {r.ordens_servico && (
                      <p className="text-xs text-[#6B7280]">OS #{r.ordens_servico.numero} — {r.ordens_servico.descricao}</p>
                    )}
                  </div>
                  <span className={st.badge}>{st.label}</span>
                </div>

                <div className="space-y-1 mb-3">
                  {r.requisicao_itens?.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="text-[#A8ADB8]">{item.almoxarifado_itens?.nome}</span>
                      <span className="font-medium text-[#F5F5F0]">{item.quantidade} {item.almoxarifado_itens?.unidade}</span>
                    </div>
                  ))}
                </div>

                {r.motivo_rejeicao && (
                  <p className="text-xs text-[#F87171] mb-2">Motivo: {r.motivo_rejeicao}</p>
                )}

                <p className="text-xs text-[#454A54] mb-2">
                  {new Date(r.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>

                {r.status === 'pendente' && (isAdmin || isSupervisor) && (
                  <div className="flex gap-2 pt-2 border-t border-[#23262E]">
                    <button
                      onClick={() => aprovarMutation.mutate(r.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#34D399]/10 border border-[#34D399]/20 text-[#34D399] rounded-xl text-xs font-medium active:bg-[#34D399]/20 transition-colors"
                    >
                      <IconCheck size={14} /> Aprovar
                    </button>
                    <button
                      onClick={() => {
                        const motivo = window.prompt('Motivo da rejeição:');
                        if (motivo) rejeitarMutation.mutate({ id: r.id, motivo });
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#F87171]/10 border border-[#F87171]/20 text-[#F87171] rounded-xl text-xs font-medium active:bg-[#F87171]/20 transition-colors"
                    >
                      <IconX size={14} /> Rejeitar
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* FAB Nova requisição */}
      <button
        onClick={() => { setOsId(''); setItens([{ item_id: '', quantidade: 1 }]); setErroForm(''); setModalAberto(true); }}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-[#F08020] shadow-[0_8px_24px_rgba(240,128,32,0.4)] flex items-center justify-center active:scale-95 transition-transform"
      >
        <IconPlus size={24} className="text-white" />
      </button>

      {/* Modal Nova requisição */}
      <Modal aberto={modalAberto} onClose={() => setModalAberto(false)} titulo="Nova requisição de material">
        <div className="space-y-4">
          {erroForm && (
            <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl text-sm text-[#F87171]">{erroForm}</div>
          )}

          <div>
            <label className={ui.label}>Vincular à OS (opcional)</label>
            <select value={osId} onChange={e => setOsId(e.target.value)} className={ui.input}>
              <option value="">Sem OS</option>
              {ordens.map(os => <option key={os.id} value={os.id}>OS #{os.numero} — {os.bairro || os.descricao || 'Sem descrição'}</option>)}
            </select>
          </div>

          <div>
            <label className={ui.label}>Itens</label>
            <div className="space-y-2">
              {itens.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <select value={item.item_id} onChange={e => setItemCampo(idx, 'item_id', e.target.value)} className={`${ui.input} flex-1`}>
                    <option value="">Selecionar item...</option>
                    {itensEstoque.map(ie => <option key={ie.id} value={ie.id}>{ie.nome} ({ie.unidade})</option>)}
                  </select>
                  <input type="number" min="1" value={item.quantidade} onChange={e => setItemCampo(idx, 'quantidade', e.target.value)} className={`${ui.input} w-20`} />
                  {itens.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="h-12 w-10 flex items-center justify-center text-[#454A54] hover:text-[#F87171] transition-colors shrink-0">
                      <IconTrash size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addItem} className="mt-2 w-full py-2.5 border border-dashed border-[#30353F] rounded-xl text-sm text-[#6B7280] hover:border-[#F08020] hover:text-[#F08020] flex items-center justify-center gap-2 transition-colors">
              <IconPlus size={14} /> Adicionar item
            </button>
          </div>

          <button
            onClick={salvarRequisicao}
            disabled={criarMutation.isPending}
            className="w-full py-3.5 bg-[#F08020] text-white rounded-xl font-semibold text-sm active:bg-[#D86E14] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {criarMutation.isPending ? <><IconLoader2 size={16} className="animate-spin" /> Enviando...</> : <><IconPlus size={16} /> Criar requisição</>}
          </button>
        </div>
      </Modal>

    </div>
  );
}
