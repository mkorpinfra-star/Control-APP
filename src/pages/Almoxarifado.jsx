import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { almoxarifadoService } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ui } from '../lib/theme';
import { IconPlus, IconSearch, IconAlertTriangle, IconPackage, IconArrowUp, IconArrowDown, IconReceipt, IconLoader2 } from '@tabler/icons-react';
import Modal from '../components/Modal';

const CATEGORIA_LABEL = {
  lampada: 'Lâmpada', reator: 'Reator', cabo: 'Cabo', rele_fotoeletrico: 'Relé fotoelétrico',
  braco: 'Braço', luminaria: 'Luminária', fusivel: 'Fusível', conector: 'Conector', outros: 'Outros',
};

const PRODUTO_INICIAL = { nome: '', categoria: 'lampada', unidade: 'un', estoque_minimo: 0, quantidade_inicial: 0 };

export default function Almoxarifado() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canGerenciarEstoque } = useAuth();
  const [busca, setBusca] = useState('');
  const [aba, setAba] = useState('estoque');
  const [modalAberto, setModalAberto] = useState(false);
  const [produto, setProduto] = useState(PRODUTO_INICIAL);
  const [erroForm, setErroForm] = useState('');
  const [editando, setEditando] = useState(null); // { item, quantidade }
  const [ajuste, setAjuste] = useState('');
  const [saida, setSaida] = useState('');

  const { data: estoque = [], isLoading } = useQuery({
    queryKey: ['almoxarifado-estoque'],
    queryFn: almoxarifadoService.getEstoque,
  });

  const criarMutation = useMutation({
    mutationFn: async (dados) => {
      const item = await almoxarifadoService.criarItem({
        nome: dados.nome, categoria: dados.categoria, unidade: dados.unidade,
        estoque_minimo: Number(dados.estoque_minimo) || 0,
      });
      if (Number(dados.quantidade_inicial) > 0) {
        await almoxarifadoService.entrada(item.id, Number(dados.quantidade_inicial), 'Estoque inicial');
      }
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['almoxarifado-estoque'] });
      setModalAberto(false);
      setProduto(PRODUTO_INICIAL);
      setErroForm('');
    },
    onError: (e) => setErroForm('Erro ao criar produto: ' + e.message),
  });

  const editarMutation = useMutation({
    mutationFn: ({ id, dados }) => almoxarifadoService.atualizarItem(id, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['almoxarifado-estoque'] });
      setEditando(null); setAjuste('');
    },
  });
  const ajusteMutation = useMutation({
    mutationFn: ({ item_id, quantidade, obs }) => almoxarifadoService.entrada(item_id, quantidade, obs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['almoxarifado-estoque'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      setEditando(null); setAjuste('');
    },
  });
  const saidaMutation = useMutation({
    mutationFn: ({ item_id, quantidade, obs }) => almoxarifadoService.saida(item_id, quantidade, obs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['almoxarifado-estoque'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      setEditando(null); setSaida('');
    },
    onError: (e) => alert(e.message),
  });

  const setCampo = (campo, valor) => setProduto(p => ({ ...p, [campo]: valor }));

  const salvarProduto = () => {
    if (!produto.nome.trim()) return setErroForm('Informe o nome do produto.');
    if (!produto.unidade.trim()) return setErroForm('Informe a unidade.');
    criarMutation.mutate(produto);
  };

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes-estoque'],
    queryFn: () => almoxarifadoService.getMovimentacoes(),
    enabled: aba === 'movimentacoes',
  });

  const estoqueFiltrado = estoque.filter(e =>
    e.almoxarifado_itens?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    e.almoxarifado_itens?.categoria?.toLowerCase().includes(busca.toLowerCase())
  );

  const itensCriticos = estoqueFiltrado.filter(e => e.quantidade <= (e.almoxarifado_itens?.estoque_minimo || 0));

  if (isLoading) {
    return (
      <div className="p-4 space-y-3 bg-[#0A0B0D] min-h-full">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-[#1A1D24] border border-[#23262E] rounded-2xl p-4 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="pb-32 bg-[#0A0B0D] min-h-full">
      {itensCriticos.length > 0 && (
        <div className="mx-4 mt-4 bg-[#F08020]/10 border border-[#F08020]/25 rounded-2xl p-3 flex items-center gap-2">
          <IconAlertTriangle size={16} className="text-[#FB8C3E] shrink-0" />
          <p className="text-xs text-[#FB8C3E]">
            <strong>{itensCriticos.length}</strong> item{itensCriticos.length > 1 ? 's' : ''} com estoque abaixo do mínimo
          </p>
        </div>
      )}

      <div className="px-4 pt-4 pb-2 flex gap-2 flex-wrap">
        {['estoque', 'movimentacoes'].map(a => (
          <button key={a} onClick={() => setAba(a)} className={ui.chip(aba === a)}>
            {a === 'estoque' ? 'Estoque atual' : 'Movimentações'}
          </button>
        ))}
        {canGerenciarEstoque && (
          <button
            onClick={() => navigate('/almoxarifado/entrada-nf')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F08020]/10 border border-[#F08020]/30 rounded-full text-xs text-[#F08020] hover:bg-[#F08020]/20 transition-colors ml-auto"
          >
            <IconReceipt size={13} /> Entrada por NF
          </button>
        )}
      </div>

      {aba === 'estoque' && (
        <>
          <div className="px-4 pb-2">
            <div className="relative">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Buscar material..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#121419] border border-[#30353F] rounded-xl text-sm text-[#F5F5F0] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F08020] focus:ring-2 focus:ring-[#F08020]/30"
              />
            </div>
          </div>

          <div className="px-4 space-y-2">
            {estoqueFiltrado.length === 0 ? (
              <div className="text-center py-16 text-[#6B7280]">
                <IconPackage size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum item cadastrado</p>
              </div>
            ) : (
              estoqueFiltrado.map(e => {
                const item = e.almoxarifado_itens;
                const critico = e.quantidade <= (item?.estoque_minimo || 0);
                const Wrapper = canGerenciarEstoque ? 'button' : 'div';
                return (
                  <Wrapper
                    key={e.id}
                    onClick={canGerenciarEstoque ? () => { setEditando({ ...item, quantidade: e.quantidade }); setAjuste(''); setSaida(''); } : undefined}
                    className={`w-full text-left bg-[#1A1D24] rounded-2xl p-4 border transition-colors ${canGerenciarEstoque ? 'active:bg-[#272B35]' : ''} ${critico ? 'border-[#F08020]/30' : 'border-[#23262E]'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#F5F5F0] text-sm">{item?.nome}</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{CATEGORIA_LABEL[item?.categoria] || item?.categoria}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold tabular-nums ${critico ? 'text-[#FB8C3E]' : 'text-[#F5F5F0]'}`}>{e.quantidade}</p>
                        <p className="text-xs text-[#6B7280]">{item?.unidade}</p>
                      </div>
                    </div>
                    {critico && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-[#FB8C3E]">
                        <IconAlertTriangle size={12} />
                        <span>Mínimo: {item?.estoque_minimo} {item?.unidade}</span>
                      </div>
                    )}
                  </Wrapper>
                );
              })
            )}
          </div>
        </>
      )}

      {/* FAB Adicionar produto */}
      {canGerenciarEstoque && (
        <button
          onClick={() => { setProduto(PRODUTO_INICIAL); setErroForm(''); setModalAberto(true); }}
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-[#F08020] shadow-[0_8px_24px_rgba(240,128,32,0.4)] flex items-center justify-center active:scale-95 transition-transform"
        >
          <IconPlus size={24} className="text-white" />
        </button>
      )}

      {/* Modal Adicionar produto */}
      <Modal aberto={modalAberto} onClose={() => setModalAberto(false)} titulo="Adicionar produto">
        <div className="space-y-4">
          {erroForm && (
            <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl text-sm text-[#F87171]">{erroForm}</div>
          )}

          <div>
            <label className={ui.label}>Nome do produto *</label>
            <input value={produto.nome} onChange={e => setCampo('nome', e.target.value)} placeholder="Ex: Lâmpada LED 100W" className={ui.input} />
          </div>

          <div>
            <label className={ui.label}>Categoria</label>
            <select value={produto.categoria} onChange={e => setCampo('categoria', e.target.value)} className={ui.input}>
              {Object.entries(CATEGORIA_LABEL).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={ui.label}>Unidade *</label>
              <input value={produto.unidade} onChange={e => setCampo('unidade', e.target.value)} placeholder="un, m, kg..." className={ui.input} />
            </div>
            <div>
              <label className={ui.label}>Estoque mínimo</label>
              <input type="number" min="0" value={produto.estoque_minimo} onChange={e => setCampo('estoque_minimo', e.target.value)} className={ui.input} />
            </div>
          </div>

          <div>
            <label className={ui.label}>Quantidade inicial em estoque</label>
            <input type="number" min="0" value={produto.quantidade_inicial} onChange={e => setCampo('quantidade_inicial', e.target.value)} className={ui.input} />
          </div>

          <button
            onClick={salvarProduto}
            disabled={criarMutation.isPending}
            className="w-full py-3.5 bg-[#F08020] text-white rounded-xl font-semibold text-sm active:bg-[#D86E14] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {criarMutation.isPending ? <><IconLoader2 size={16} className="animate-spin" /> Salvando...</> : <><IconPlus size={16} /> Adicionar produto</>}
          </button>
        </div>
      </Modal>

      {/* Modal Editar produto */}
      <Modal aberto={!!editando} onClose={() => setEditando(null)} titulo="Editar produto">
        {editando && (
          <div className="space-y-4">
            <div>
              <label className={ui.label}>Nome do produto</label>
              <input value={editando.nome || ''} onChange={e => setEditando(v => ({ ...v, nome: e.target.value }))} className={ui.input} />
            </div>
            <div>
              <label className={ui.label}>Categoria</label>
              <select value={editando.categoria} onChange={e => setEditando(v => ({ ...v, categoria: e.target.value }))} className={ui.input}>
                {Object.entries(CATEGORIA_LABEL).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={ui.label}>Unidade</label>
                <input value={editando.unidade || ''} onChange={e => setEditando(v => ({ ...v, unidade: e.target.value }))} className={ui.input} />
              </div>
              <div>
                <label className={ui.label}>Estoque mínimo</label>
                <input type="number" min="0" value={editando.estoque_minimo ?? 0} onChange={e => setEditando(v => ({ ...v, estoque_minimo: e.target.value }))} className={ui.input} />
              </div>
            </div>

            <button
              onClick={() => editarMutation.mutate({ id: editando.id, dados: { nome: editando.nome, categoria: editando.categoria, unidade: editando.unidade, estoque_minimo: Number(editando.estoque_minimo) || 0 } })}
              disabled={editarMutation.isPending}
              className="w-full py-3.5 bg-[#F08020] text-white rounded-xl font-semibold text-sm active:bg-[#D86E14] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {editarMutation.isPending ? <><IconLoader2 size={16} className="animate-spin" /> Salvando...</> : 'Salvar alterações'}
            </button>

            {/* Movimentação de estoque */}
            <div className="pt-2 border-t border-[#23262E] space-y-3">
              <p className="text-[11px] text-[#454A54]">Saldo atual: <strong className="text-[#A8ADB8]">{editando.quantidade} {editando.unidade}</strong></p>

              <div>
                <label className={ui.label}>Entrada manual</label>
                <div className="flex gap-2">
                  <input type="number" min="1" value={ajuste} onChange={e => setAjuste(e.target.value)} placeholder="Qtd a adicionar" className={`${ui.input} flex-1`} />
                  <button
                    onClick={() => Number(ajuste) > 0 && ajusteMutation.mutate({ item_id: editando.id, quantidade: Number(ajuste), obs: 'Entrada manual' })}
                    disabled={ajusteMutation.isPending || !(Number(ajuste) > 0)}
                    className="px-4 bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] rounded-xl text-sm font-medium disabled:opacity-40 flex items-center gap-1"
                  >
                    <IconArrowUp size={14} /> Entrada
                  </button>
                </div>
              </div>

              <div>
                <label className={ui.label}>Saída manual</label>
                <div className="flex gap-2">
                  <input type="number" min="1" value={saida} onChange={e => setSaida(e.target.value)} placeholder="Qtd a retirar" className={`${ui.input} flex-1`} />
                  <button
                    onClick={() => Number(saida) > 0 && saidaMutation.mutate({ item_id: editando.id, quantidade: Number(saida), obs: 'Saída manual' })}
                    disabled={saidaMutation.isPending || !(Number(saida) > 0)}
                    className="px-4 bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171] rounded-xl text-sm font-medium disabled:opacity-40 flex items-center gap-1"
                  >
                    <IconArrowDown size={14} /> Saída
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {aba === 'movimentacoes' && (
        <div className="px-4 space-y-2">
          {movimentacoes.map(m => (
            <div key={m.id} className="bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-[#F5F5F0]">{m.almoxarifado_itens?.nome}</p>
                <span className={`text-sm font-bold tabular-nums ${m.tipo === 'entrada' ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
                  {m.tipo === 'entrada' ? '+' : '-'}{m.quantidade} {m.almoxarifado_itens?.unidade}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#6B7280]">
                  {m.tipo === 'entrada' ? 'Entrada' : m.tipo === 'saida_requisicao' ? 'Saída (requisição)' : 'Saída manual'}
                  {m.ordens_servico && ` — OS #${m.ordens_servico.numero}`}
                </p>
                <p className="text-xs text-[#6B7280]">Saldo: {m.saldo_apos} {m.almoxarifado_itens?.unidade}</p>
              </div>
              <div className="mt-2 pt-2 border-t border-[#23262E] space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <IconArrowUp size={12} className="text-[#34D399] shrink-0" />
                  <span className="text-xs text-[#6B7280]">Entregou:</span>
                  <span className="text-xs text-[#A8ADB8] font-medium">{m.entregue_por?.nome || '—'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconArrowDown size={12} className="text-[#FB8C3E] shrink-0" />
                  <span className="text-xs text-[#6B7280]">Retirou:</span>
                  <span className="text-xs text-[#A8ADB8] font-medium">{m.retirado_por?.nome || '—'}</span>
                </div>
                <p className="text-xs text-[#454A54] pt-0.5">
                  {new Date(m.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
