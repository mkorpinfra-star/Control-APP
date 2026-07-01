import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contratosService } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { STATUS_CONTRATO, ui } from '../lib/theme';
import { IconPlus, IconSearch, IconBuilding, IconMapPin, IconLoader2 } from '@tabler/icons-react';
import Modal from '../components/Modal';

const STATUS_LABEL = { ativo: 'Ativo', encerrado: 'Encerrado', suspenso: 'Suspenso' };
const brl = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const FORM_INICIAL = {
  nome: '', municipio: '', estado: '', responsavel: '', data_inicio: '', data_fim: '', status: 'ativo', valor: '', sla_horas: '',
};

export default function Contratos() {
  const queryClient = useQueryClient();
  const { podeVerValores } = useAuth();
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [erroForm, setErroForm] = useState('');

  const { data: contratos = [], isLoading } = useQuery({
    queryKey: ['contratos'],
    queryFn: contratosService.getAll,
  });

  const salvarMutation = useMutation({
    mutationFn: ({ id, dados }) => id ? contratosService.update(id, dados) : contratosService.create(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      setModalAberto(false);
      setEditandoId(null);
      setForm(FORM_INICIAL);
      setErroForm('');
    },
    onError: (e) => setErroForm('Erro ao salvar contrato: ' + e.message),
  });

  const setCampo = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

  const abrirNovo = () => { setEditandoId(null); setForm(FORM_INICIAL); setErroForm(''); setModalAberto(true); };
  const abrirEdicao = (c) => {
    setEditandoId(c.id);
    setForm({
      nome: c.nome || '', municipio: c.municipio || '', estado: c.estado || '', responsavel: c.responsavel || '',
      data_inicio: c.data_inicio || '', data_fim: c.data_fim || '', status: c.status || 'ativo',
      valor: c.valor ?? '', sla_horas: c.sla_horas ?? '',
    });
    setErroForm('');
    setModalAberto(true);
  };

  const salvar = () => {
    if (!form.nome.trim()) return setErroForm('Informe o nome do contrato.');
    const dados = { ...form };
    if (!dados.data_inicio) delete dados.data_inicio;
    if (!dados.data_fim) delete dados.data_fim;
    dados.valor = dados.valor ? Number(dados.valor) : null;
    dados.sla_horas = dados.sla_horas ? Number(dados.sla_horas) : null;
    salvarMutation.mutate({ id: editandoId, dados });
  };

  const filtrados = contratos.filter(c =>
    c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    c.municipio?.toLowerCase().includes(busca.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-4 space-y-3 bg-[#0A0B0D] min-h-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#1A1D24] border border-[#23262E] rounded-2xl p-4 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="pb-32 bg-[#0A0B0D] min-h-full">
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Buscar contrato ou município..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#121419] border border-[#30353F] rounded-xl text-sm text-[#F5F5F0] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F08020] focus:ring-2 focus:ring-[#F08020]/30"
          />
        </div>
      </div>

      <div className="px-4 py-2">
        <p className="text-xs text-[#6B7280]">{filtrados.length} contrato{filtrados.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 space-y-3">
        {filtrados.length === 0 ? (
          <div className="text-center py-16 text-[#6B7280]">
            <IconBuilding size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum contrato cadastrado</p>
          </div>
        ) : (
          filtrados.map(c => (
            <button key={c.id} onClick={() => abrirEdicao(c)} className="w-full text-left bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E] active:bg-[#272B35] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-[#F5F5F0]">{c.nome}</p>
                <span className={STATUS_CONTRATO[c.status]}>{STATUS_LABEL[c.status]}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#A8ADB8]">
                <IconMapPin size={12} className="text-[#6B7280]" />
                <span>{c.municipio} — {c.estado}</span>
              </div>
              {c.responsavel && <p className="text-xs text-[#6B7280] mt-1">Resp.: {c.responsavel}</p>}
              {(c.data_inicio || c.data_fim) && (
                <p className="text-xs text-[#6B7280] mt-1">
                  {c.data_inicio ? new Date(c.data_inicio).toLocaleDateString('pt-BR') : '—'}
                  {' → '}
                  {c.data_fim ? new Date(c.data_fim).toLocaleDateString('pt-BR') : 'Indeterminado'}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#23262E] text-xs">
                {podeVerValores && c.valor != null && <span className="text-[#34D399] font-medium">{brl(c.valor)}</span>}
                {c.sla_horas != null && <span className="text-[#6B7280]">SLA: {c.sla_horas}h</span>}
              </div>
            </button>
          ))
        )}
      </div>

      {/* FAB Novo contrato */}
      <button
        onClick={abrirNovo}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-[#F08020] shadow-[0_8px_24px_rgba(240,128,32,0.4)] flex items-center justify-center active:scale-95 transition-transform"
      >
        <IconPlus size={24} className="text-white" />
      </button>

      {/* Modal Novo/Editar contrato */}
      <Modal aberto={modalAberto} onClose={() => { setModalAberto(false); setEditandoId(null); }} titulo={editandoId ? 'Editar contrato' : 'Novo contrato'}>
        <div className="space-y-4">
          {erroForm && (
            <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl text-sm text-[#F87171]">{erroForm}</div>
          )}

          <div>
            <label className={ui.label}>Nome do contrato *</label>
            <input value={form.nome} onChange={e => setCampo('nome', e.target.value)} placeholder="Ex: Prefeitura de São Paulo" className={ui.input} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={ui.label}>Município</label>
              <input value={form.municipio} onChange={e => setCampo('municipio', e.target.value)} placeholder="Município" className={ui.input} />
            </div>
            <div>
              <label className={ui.label}>Estado (UF)</label>
              <input value={form.estado} onChange={e => setCampo('estado', e.target.value)} maxLength={2} placeholder="SP" className={ui.input} />
            </div>
          </div>

          <div>
            <label className={ui.label}>Responsável</label>
            <input value={form.responsavel} onChange={e => setCampo('responsavel', e.target.value)} placeholder="Nome do responsável" className={ui.input} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={ui.label}>Data início</label>
              <input type="date" value={form.data_inicio} onChange={e => setCampo('data_inicio', e.target.value)} className={`${ui.input} [color-scheme:dark]`} />
            </div>
            <div>
              <label className={ui.label}>Data fim</label>
              <input type="date" value={form.data_fim} onChange={e => setCampo('data_fim', e.target.value)} className={`${ui.input} [color-scheme:dark]`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {podeVerValores && (
              <div>
                <label className={ui.label}>Valor do contrato (R$)</label>
                <input type="number" step="0.01" value={form.valor} onChange={e => setCampo('valor', e.target.value)} placeholder="0,00" className={ui.input} />
              </div>
            )}
            <div className={podeVerValores ? '' : 'col-span-2'}>
              <label className={ui.label}>SLA padrão (horas)</label>
              <input type="number" min="0" value={form.sla_horas} onChange={e => setCampo('sla_horas', e.target.value)} placeholder="Ex: 48" className={ui.input} />
            </div>
          </div>

          <div>
            <label className={ui.label}>Status</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(STATUS_LABEL).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => setCampo('status', v)}
                  className={`py-2 rounded-xl text-xs font-medium transition-colors ${form.status === v ? 'bg-[#F08020] text-[#0A0B0D]' : 'bg-[#121419] text-[#A8ADB8] border border-[#30353F]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={salvar}
            disabled={salvarMutation.isPending}
            className="w-full py-3.5 bg-[#F08020] text-white rounded-xl font-semibold text-sm active:bg-[#D86E14] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {salvarMutation.isPending ? <><IconLoader2 size={16} className="animate-spin" /> Salvando...</> : <><IconPlus size={16} /> {editandoId ? 'Salvar alterações' : 'Criar contrato'}</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}
