import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordensServicoService, contratosService, usuariosService, notificacoesService, servicosService, osServicosService } from '../services/supabase';
import { STATUS_OS, PRIORIDADE, ui } from '../lib/theme';
import { IconPlus, IconSearch, IconMapPin, IconAlertTriangle, IconClipboardList, IconX, IconMessageCircle, IconLoader2 } from '@tabler/icons-react';
import ComentariosOS from '../components/ComentariosOS';
import ServicosOS from '../components/ServicosOS';
import Modal from '../components/Modal';

const TIPO_DEFEITO_LABEL = {
  lampada_queimada: 'Lâmpada queimada',
  reator_defeituoso: 'Reator defeituoso',
  cabo_danificado: 'Cabo danificado',
  rele_fotoeletrico: 'Relé fotoelétrico',
  braco_quebrado: 'Braço quebrado',
  poste_danificado: 'Poste danificado',
  vandalismo: 'Vandalismo',
  manutencao_preventiva: 'Manutenção preventiva',
  outro: 'Outro',
};

const TIPO_DEFEITO_OPTS = Object.entries(TIPO_DEFEITO_LABEL);

const FORM_INICIAL = {
  contrato_id: '', responsavel_id: '', tipo_defeito: 'lampada_queimada',
  prioridade: 'normal', descricao: '', logradouro: '', bairro: '', numero_poste: '', status: 'aberta',
};

export default function OrdensServico() {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [osSelecionada, setOsSelecionada] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [erroForm, setErroForm] = useState('');

  const { data: ordens = [], isLoading } = useQuery({
    queryKey: ['ordens-servico', filtroStatus],
    queryFn: () => ordensServicoService.getAll({ status: filtroStatus || undefined }),
  });

  const { data: contratos = [] } = useQuery({ queryKey: ['contratos'], queryFn: contratosService.getAll });
  const { data: responsaveis = [] } = useQuery({ queryKey: ['usuarios'], queryFn: () => usuariosService.getAll() });

  const criarMutation = useMutation({
    mutationFn: async (dados) => {
      const os = await ordensServicoService.create(dados);
      if (dados.responsavel_id) {
        await notificacoesService.criar({
          usuario_id: dados.responsavel_id,
          titulo: `Nova OS #${os.numero} atribuída a você`,
          mensagem: `${TIPO_DEFEITO_LABEL[os.tipo_defeito] || os.tipo_defeito}${os.bairro ? ' — ' + os.bairro : ''}`,
          tipo: 'os', link: '/registro-campo',
        });
      }
      return os;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordens-servico'] });
      setModalAberto(false);
      setForm(FORM_INICIAL);
      setErroForm('');
    },
    onError: (e) => setErroForm('Erro ao criar OS: ' + e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, dados, notificar }) => {
      const os = await ordensServicoService.update(id, dados);
      if (notificar && dados.responsavel_id) {
        await notificacoesService.criar({
          usuario_id: dados.responsavel_id,
          titulo: `OS #${os.numero} atribuída a você`,
          mensagem: `${TIPO_DEFEITO_LABEL[os.tipo_defeito] || os.tipo_defeito}${os.bairro ? ' — ' + os.bairro : ''}`,
          tipo: 'os', link: '/registro-campo',
        });
      }
      return os;
    },
    onSuccess: (osAtualizada) => {
      queryClient.invalidateQueries({ queryKey: ['ordens-servico'] });
      setOsSelecionada(prev => prev ? { ...prev, ...osAtualizada } : prev);
    },
  });

  const setCampo = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

  const salvarOS = () => {
    if (!form.contrato_id) return setErroForm('Selecione o contrato.');
    if (!form.tipo_defeito) return setErroForm('Selecione o tipo de defeito.');
    const dados = { ...form };
    if (!dados.responsavel_id) delete dados.responsavel_id;
    criarMutation.mutate(dados);
  };

  const ordensFiltradas = ordens.filter(os =>
    os.numero?.toString().includes(busca) ||
    os.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
    os.bairro?.toLowerCase().includes(busca.toLowerCase()) ||
    os.numero_poste?.toLowerCase().includes(busca.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-4 space-y-3 bg-[#0A0B0D] min-h-full">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-[#1A1D24] border border-[#23262E] rounded-2xl p-4 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="pb-32 bg-[#0A0B0D] min-h-full">
      <div className="px-4 pt-4 pb-2 space-y-2">
        <div className="relative">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Buscar por OS, bairro, poste..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#121419] border border-[#30353F] rounded-xl text-sm text-[#F5F5F0] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F08020] focus:ring-2 focus:ring-[#F08020]/30"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {['', 'aberta', 'em_andamento', 'concluida'].map(s => (
            <button key={s} onClick={() => setFiltroStatus(s)} className={ui.chip(filtroStatus === s)}>
              {s === '' ? 'Todas' : STATUS_OS[s]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-2">
        <p className="text-xs text-[#6B7280]">{ordensFiltradas.length} ordem{ordensFiltradas.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 space-y-3">
        {ordensFiltradas.length === 0 ? (
          <div className="text-center py-16 text-[#6B7280]">
            <IconClipboardList size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma ordem encontrada</p>
          </div>
        ) : (
          ordensFiltradas.map(os => {
            const status = STATUS_OS[os.status] || STATUS_OS.aberta;
            const prio = PRIORIDADE[os.prioridade];
            return (
              <div
                key={os.id}
                className="bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E] active:scale-[0.99] transition-transform cursor-pointer"
                onClick={() => setOsSelecionada(os)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#6B7280]">OS #{os.numero}</span>
                      {os.prioridade === 'urgente' && <IconAlertTriangle size={14} className="text-[#FB8C3E]" />}
                    </div>
                    <p className="font-medium text-[#F5F5F0] text-sm mt-0.5">
                      {TIPO_DEFEITO_LABEL[os.tipo_defeito] || os.tipo_defeito}
                    </p>
                  </div>
                  <span className={status.badge}>{status.label}</span>
                </div>

                {(os.bairro || os.logradouro) && (
                  <div className="flex items-center gap-1 text-xs text-[#A8ADB8] mb-1">
                    <IconMapPin size={12} className="text-[#6B7280]" />
                    <span>{[os.logradouro, os.bairro].filter(Boolean).join(' — ')}</span>
                  </div>
                )}
                {os.numero_poste && <p className="text-xs text-[#6B7280]">Poste: {os.numero_poste}</p>}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#23262E]">
                  <span className="text-xs text-[#6B7280]">{os.contratos?.nome || 'Sem contrato'}</span>
                  <div className="flex items-center gap-2">
                    {prio && <span className={prio.badge}><span className="w-1.5 h-1.5 rounded-full" style={{ background: prio.dot }} />{prio.label}</span>}
                    <span className="text-xs text-[#6B7280]">
                      {os.data_abertura ? new Date(os.data_abertura).toLocaleDateString('pt-BR') : '—'}
                    </span>
                    <IconMessageCircle size={13} className="text-[#454A54]" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FAB Nova OS */}
      <button
        onClick={() => { setForm(FORM_INICIAL); setErroForm(''); setModalAberto(true); }}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-[#F08020] shadow-[0_8px_24px_rgba(240,128,32,0.4)] flex items-center justify-center active:scale-95 transition-transform"
      >
        <IconPlus size={24} className="text-white" />
      </button>

      {/* Modal Nova OS */}
      <Modal aberto={modalAberto} onClose={() => setModalAberto(false)} titulo="Nova Ordem de Serviço">
        <div className="space-y-4">
          {erroForm && (
            <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl text-sm text-[#F87171]">{erroForm}</div>
          )}

          <div>
            <label className={ui.label}>Contrato *</label>
            <select value={form.contrato_id} onChange={e => setCampo('contrato_id', e.target.value)} className={ui.input}>
              <option value="">Selecione o contrato</option>
              {contratos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          <div>
            <label className={ui.label}>Tipo de defeito *</label>
            <select value={form.tipo_defeito} onChange={e => setCampo('tipo_defeito', e.target.value)} className={ui.input}>
              {TIPO_DEFEITO_OPTS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </div>

          <div>
            <label className={ui.label}>Prioridade</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(PRIORIDADE).map(([v, p]) => (
                <button
                  key={v}
                  onClick={() => setCampo('prioridade', v)}
                  className={`py-2 rounded-xl text-xs font-medium transition-colors ${form.prioridade === v ? 'bg-[#F08020] text-[#0A0B0D]' : 'bg-[#121419] text-[#A8ADB8] border border-[#30353F]'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={ui.label}>Responsável</label>
            <select value={form.responsavel_id} onChange={e => setCampo('responsavel_id', e.target.value)} className={ui.input}>
              <option value="">Sem responsável (atribuir depois)</option>
              {responsaveis.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={ui.label}>Logradouro</label>
              <input value={form.logradouro} onChange={e => setCampo('logradouro', e.target.value)} placeholder="Rua/Av." className={ui.input} />
            </div>
            <div>
              <label className={ui.label}>Bairro</label>
              <input value={form.bairro} onChange={e => setCampo('bairro', e.target.value)} placeholder="Bairro" className={ui.input} />
            </div>
          </div>

          <div>
            <label className={ui.label}>Número do poste</label>
            <input value={form.numero_poste} onChange={e => setCampo('numero_poste', e.target.value)} placeholder="Ex: 12345-A" className={ui.input} />
          </div>

          <div>
            <label className={ui.label}>Descrição</label>
            <textarea value={form.descricao} onChange={e => setCampo('descricao', e.target.value)} rows={3} placeholder="Detalhes da ocorrência..." className={`${ui.input} h-auto py-3 resize-none`} />
          </div>

          <button
            onClick={salvarOS}
            disabled={criarMutation.isPending}
            className="w-full py-3.5 bg-[#F08020] text-white rounded-xl font-semibold text-sm active:bg-[#D86E14] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {criarMutation.isPending ? <><IconLoader2 size={16} className="animate-spin" /> Criando...</> : <><IconPlus size={16} /> Criar OS</>}
          </button>
        </div>
      </Modal>

      {/* Drawer de detalhe + mensagens */}
      {osSelecionada && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOsSelecionada(null)} />
          <div className="relative bg-[#0E0F13] border-t border-[#23262E] rounded-t-3xl max-h-[85vh] overflow-y-auto">
            {/* Handle */}
            <div className="sticky top-0 bg-[#0E0F13] pt-3 pb-2 px-4 border-b border-[#23262E] flex items-center justify-between z-10">
              <div>
                <span className="text-xs font-mono text-[#6B7280]">OS #{osSelecionada.numero}</span>
                <p className="font-semibold text-[#F5F5F0] text-sm">{TIPO_DEFEITO_LABEL[osSelecionada.tipo_defeito] || osSelecionada.tipo_defeito}</p>
              </div>
              <button onClick={() => setOsSelecionada(null)} className="text-[#6B7280] hover:text-[#F5F5F0]">
                <IconX size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Info resumida */}
              <div className="bg-[#121419] border border-[#23262E] rounded-2xl p-3 space-y-1.5 text-sm">
                {osSelecionada.descricao && <p className="text-[#A8ADB8]">{osSelecionada.descricao}</p>}
                {(osSelecionada.logradouro || osSelecionada.bairro) && (
                  <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                    <IconMapPin size={12} />
                    {[osSelecionada.logradouro, osSelecionada.bairro].filter(Boolean).join(' — ')}
                  </div>
                )}
                {osSelecionada.numero_poste && <p className="text-xs text-[#6B7280]">Poste: {osSelecionada.numero_poste}</p>}
                {osSelecionada.usuarios?.nome && <p className="text-xs text-[#6B7280]">Responsável: {osSelecionada.usuarios.nome}</p>}
              </div>

              {/* Gestão da OS */}
              <div className="bg-[#121419] border border-[#23262E] rounded-2xl p-3 space-y-3">
                <p className="text-xs font-semibold text-[#A8ADB8] uppercase tracking-wider">Gerenciar</p>
                <div>
                  <label className="text-xs text-[#6B7280] mb-1.5 block">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(STATUS_OS).map(([v, s]) => (
                      <button
                        key={v}
                        onClick={() => updateMutation.mutate({ id: osSelecionada.id, dados: { status: v, ...(v === 'concluida' ? { data_conclusao: new Date().toISOString().split('T')[0] } : {}) } })}
                        className={`py-2 rounded-xl text-xs font-medium transition-colors ${osSelecionada.status === v ? 'bg-[#F08020] text-[#0A0B0D]' : 'bg-[#1A1D24] text-[#A8ADB8] border border-[#30353F]'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#6B7280] mb-1.5 block">Responsável</label>
                  <select
                    value={osSelecionada.responsavel_id || ''}
                    onChange={e => updateMutation.mutate({ id: osSelecionada.id, dados: { responsavel_id: e.target.value || null }, notificar: !!e.target.value })}
                    className={ui.input}
                  >
                    <option value="">Sem responsável</option>
                    {responsaveis.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </div>
              </div>

              {/* Serviços executados (medição) */}
              <ServicosOS osId={osSelecionada.id} contratoId={osSelecionada.contrato_id} />

              {/* Feed de mensagens */}
              <ComentariosOS osId={osSelecionada.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
