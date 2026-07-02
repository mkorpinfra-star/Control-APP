import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requisicoesService, almoxarifadoService, ordensServicoService, notificacoesService } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { STATUS_REQ, ui } from '../lib/theme';
import { IconPackage, IconCheck, IconX, IconPlus, IconTrash, IconLoader2, IconMessageCircle, IconClockHour4 } from '@tabler/icons-react';
import Modal from '../components/Modal';
import InputDialog from '../components/InputDialog';

const ITEM_INICIAL = { modo: 'catalogo', item_id: '', nome_livre: '', quantidade: 1 };

export default function Requisicoes() {
  const { isAdmin, isSupervisor, canAprovarRequisicao, perfil } = useAuth();
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState('pendente');
  const [modalAberto, setModalAberto] = useState(false);
  const [osId, setOsId] = useState('');
  const [itens, setItens] = useState([{ ...ITEM_INICIAL }]);
  const [erroForm, setErroForm] = useState('');
  const [reqRejeitar, setReqRejeitar] = useState(null);
  const [respondendoItem, setRespondendoItem] = useState(null); // item da requisição sendo respondido

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
    mutationFn: async ({ dados, itens }) => {
      const req = await requisicoesService.create(dados, itens);
      await notificacoesService.notificarCargos(['admin', 'almoxarife', 'supervisor'], {
        titulo: 'Nova requisição de material',
        mensagem: `${perfil?.nome} solicitou ${itens.length} item(ns).`,
        tipo: 'info', link: '/requisicoes', exceto: perfil?.id,
      });
      return req;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisicoes'] });
      setModalAberto(false);
      setOsId(''); setItens([{ ...ITEM_INICIAL }]); setErroForm('');
    },
    onError: (e) => setErroForm('Erro ao criar requisição: ' + e.message),
  });

  const setItemCampo = (idx, campo, valor) => setItens(prev => prev.map((it, i) => i === idx ? { ...it, [campo]: valor } : it));
  const addItem = () => setItens(prev => [...prev, { ...ITEM_INICIAL }]);
  const removeItem = (idx) => setItens(prev => prev.filter((_, i) => i !== idx));

  const salvarRequisicao = () => {
    const validos = itens.filter(i =>
      Number(i.quantidade) > 0 && ((i.modo === 'catalogo' && i.item_id) || (i.modo === 'livre' && i.nome_livre.trim()))
    );
    if (validos.length === 0) return setErroForm('Adicione ao menos um item (do catálogo ou descrito).');
    criarMutation.mutate({
      dados: { usuario_id: perfil.id, os_id: osId || null },
      itens: validos.map(i => i.modo === 'catalogo'
        ? { item_id: i.item_id, quantidade: Number(i.quantidade) }
        : { item_id: null, nome_livre: i.nome_livre.trim(), quantidade: Number(i.quantidade) }
      ),
    });
  };

  const aprovarMutation = useMutation({
    mutationFn: async (req) => {
      await requisicoesService.aprovar(req.id);
      await notificacoesService.criar({
        usuario_id: req.usuario_id,
        titulo: 'Requisição aprovada',
        mensagem: 'Sua requisição de material foi aprovada. Retire no almoxarifado.',
        tipo: 'info', link: '/requisicoes',
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requisicoes'] }),
    onError: (e) => alert('Erro ao aprovar: ' + e.message),
  });
  const rejeitarMutation = useMutation({
    mutationFn: async ({ req, motivo }) => {
      await requisicoesService.rejeitar(req.id, motivo);
      await notificacoesService.criar({
        usuario_id: req.usuario_id,
        titulo: 'Requisição rejeitada',
        mensagem: `Motivo: ${motivo}`,
        tipo: 'info', link: '/requisicoes',
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requisicoes'] }),
  });

  const responderMutation = useMutation({
    mutationFn: async ({ item, req, disponivel, resposta_almoxarife, previsao_data }) => {
      await requisicoesService.responderItemLivre(item.id, { disponivel, resposta_almoxarife, previsao_data });
      await notificacoesService.criar({
        usuario_id: req.usuario_id,
        titulo: `Sobre "${item.nome_livre}"`,
        mensagem: resposta_almoxarife || (disponivel ? 'Disponível.' : 'Indisponível no momento.'),
        tipo: 'info', link: '/requisicoes',
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['requisicoes'] }); setRespondendoItem(null); },
    onError: (e) => alert('Erro ao responder: ' + e.message),
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

                <div className="space-y-2 mb-3">
                  {r.requisicao_itens?.map(item => {
                    const livre = !item.item_id;
                    return (
                      <div key={item.id} className={livre ? 'bg-[#121419] border border-[#30353F] rounded-xl p-2' : ''}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#A8ADB8] flex items-center gap-1">
                            {livre && <IconMessageCircle size={11} className="text-[#FBBF24] shrink-0" />}
                            {item.almoxarifado_itens?.nome || item.nome_livre}
                          </span>
                          <span className="font-medium text-[#F5F5F0]">{item.quantidade} {item.almoxarifado_itens?.unidade || 'un'}</span>
                        </div>
                        {livre && (
                          <div className="mt-1.5">
                            {item.resposta_almoxarife ? (
                              <div className={`text-[11px] px-2 py-1 rounded-lg ${item.disponivel ? 'bg-[#34D399]/10 text-[#34D399]' : 'bg-[#F87171]/10 text-[#F87171]'}`}>
                                {item.resposta_almoxarife}
                                {item.previsao_data && <span className="opacity-70"> · previsão {new Date(item.previsao_data + 'T12:00:00').toLocaleDateString('pt-BR')}</span>}
                              </div>
                            ) : canAprovarRequisicao ? (
                              <button onClick={() => setRespondendoItem({ item, req: r })} className="text-[11px] text-[#5B8DEF] flex items-center gap-1">
                                <IconClockHour4 size={11} /> Responder disponibilidade
                              </button>
                            ) : (
                              <p className="text-[11px] text-[#454A54]">Aguardando resposta do almoxarifado</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {r.motivo_rejeicao && (
                  <p className="text-xs text-[#F87171] mb-2">Motivo: {r.motivo_rejeicao}</p>
                )}

                <p className="text-xs text-[#454A54] mb-2">
                  {new Date(r.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>

                {r.status === 'pendente' && canAprovarRequisicao && (
                  <div className="flex gap-2 pt-2 border-t border-[#23262E]">
                    <button
                      onClick={() => aprovarMutation.mutate(r)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#34D399]/10 border border-[#34D399]/20 text-[#34D399] rounded-xl text-xs font-medium active:bg-[#34D399]/20 transition-colors"
                    >
                      <IconCheck size={14} /> Aprovar
                    </button>
                    <button
                      onClick={() => setReqRejeitar(r)}
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

      {/* Diálogo de rejeição */}
      <InputDialog
        aberto={!!reqRejeitar}
        titulo="Rejeitar requisição"
        label="Motivo da rejeição"
        placeholder="Descreva o motivo..."
        confirmarLabel="Rejeitar"
        onClose={() => setReqRejeitar(null)}
        onConfirmar={(motivo) => { rejeitarMutation.mutate({ req: reqRejeitar, motivo }); setReqRejeitar(null); }}
      />

      {/* Modal resposta do almoxarife sobre item de texto livre */}
      <RespostaItemModal
        aberto={!!respondendoItem}
        onClose={() => setRespondendoItem(null)}
        dados={respondendoItem}
        onEnviar={(payload) => responderMutation.mutate(payload)}
        enviando={responderMutation.isPending}
      />

      {/* FAB Nova requisição */}
      <button
        onClick={() => { setOsId(''); setItens([{ ...ITEM_INICIAL }]); setErroForm(''); setModalAberto(true); }}
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
            <div className="space-y-3">
              {itens.map((item, idx) => (
                <div key={idx} className="bg-[#121419] border border-[#23262E] rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setItemCampo(idx, 'modo', 'catalogo')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${item.modo === 'catalogo' ? 'bg-[#F08020] text-[#0A0B0D]' : 'bg-[#1A1D24] text-[#6B7280] border border-[#30353F]'}`}
                      >
                        Do estoque
                      </button>
                      <button
                        onClick={() => setItemCampo(idx, 'modo', 'livre')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${item.modo === 'livre' ? 'bg-[#F08020] text-[#0A0B0D]' : 'bg-[#1A1D24] text-[#6B7280] border border-[#30353F]'}`}
                      >
                        Não sei se tem
                      </button>
                    </div>
                    {itens.length > 1 && (
                      <button onClick={() => removeItem(idx)} className="text-[#454A54] hover:text-[#F87171] transition-colors shrink-0">
                        <IconTrash size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 items-start">
                    {item.modo === 'catalogo' ? (
                      <select value={item.item_id} onChange={e => setItemCampo(idx, 'item_id', e.target.value)} className={`${ui.input} flex-1 h-11`}>
                        <option value="">Selecionar item...</option>
                        {itensEstoque.map(ie => <option key={ie.id} value={ie.id}>{ie.nome} ({ie.unidade})</option>)}
                      </select>
                    ) : (
                      <input
                        type="text" value={item.nome_livre} onChange={e => setItemCampo(idx, 'nome_livre', e.target.value)}
                        placeholder="Descreva o material que precisa..."
                        className={`${ui.input} flex-1 h-11`}
                      />
                    )}
                    <input type="number" min="1" value={item.quantidade} onChange={e => setItemCampo(idx, 'quantidade', e.target.value)} className={`${ui.input} w-16 h-11`} />
                  </div>
                  {item.modo === 'livre' && (
                    <p className="text-[10px] text-[#454A54]">O almoxarife vai verificar e te avisar se tem ou quando vai ter.</p>
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

function RespostaItemModal({ aberto, onClose, dados, onEnviar, enviando }) {
  const [disponivel, setDisponivel] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [previsao, setPrevisao] = useState('');

  return (
    <Modal aberto={aberto} onClose={onClose} titulo="Responder disponibilidade">
      {dados && (
        <div className="space-y-4">
          <p className="text-sm text-[#A8ADB8]">Material: <strong className="text-[#F5F5F0]">{dados.item.nome_livre}</strong> ({dados.item.quantidade} un.)</p>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setDisponivel(true)} className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${disponivel ? 'bg-[#34D399]/15 border border-[#34D399]/40 text-[#34D399]' : 'bg-[#121419] border border-[#30353F] text-[#6B7280]'}`}>
              Temos / vamos ter
            </button>
            <button onClick={() => setDisponivel(false)} className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${!disponivel ? 'bg-[#F87171]/15 border border-[#F87171]/40 text-[#F87171]' : 'bg-[#121419] border border-[#30353F] text-[#6B7280]'}`}>
              Não temos
            </button>
          </div>

          <div>
            <label className={ui.label}>Mensagem para o solicitante</label>
            <textarea value={mensagem} onChange={e => setMensagem(e.target.value)} rows={2} placeholder="Ex: Não temos em estoque, mas chega semana que vem." className={`${ui.input} h-auto py-2.5 resize-none`} />
          </div>

          <div>
            <label className={ui.label}>Previsão de chegada (opcional)</label>
            <input type="date" value={previsao} onChange={e => setPrevisao(e.target.value)} className={`${ui.input} [color-scheme:dark]`} />
          </div>

          <button
            onClick={() => onEnviar({ item: dados.item, req: dados.req, disponivel, resposta_almoxarife: mensagem.trim() || (disponivel ? 'Disponível.' : 'Indisponível no momento.'), previsao_data: previsao })}
            disabled={enviando}
            className="w-full py-3.5 bg-[#F08020] text-white rounded-xl font-semibold text-sm active:bg-[#D86E14] transition-colors disabled:opacity-60"
          >
            {enviando ? 'Enviando...' : 'Enviar resposta'}
          </button>
        </div>
      )}
    </Modal>
  );
}
