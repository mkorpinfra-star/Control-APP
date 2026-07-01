import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CARGO, ui } from '../lib/theme';
import { IconSearch, IconPlus, IconUser, IconLoader2, IconCheck } from '@tabler/icons-react';
import Modal from '../components/Modal';

const CARGOS = ['eletricista', 'ajudante', 'motorista', 'supervisor', 'admin'];

const FORM_INICIAL = {
  nome: '', email: '', senha: '', cargo: 'eletricista', matricula: '', telefone: '',
};

export default function Funcionarios() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [erroForm, setErroForm] = useState('');
  const [sucesso, setSucesso] = useState('');

  const { data: funcionarios = [], isLoading } = useQuery({
    queryKey: ['funcionarios', filtro],
    queryFn: () => usuariosService.getAll(filtro || null),
  });

  const criarMutation = useMutation({
    mutationFn: (dados) => usuariosService.criarComLogin(dados),
    onSuccess: (novo) => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setSucesso(`${novo.nome} criado com sucesso! Já pode fazer login.`);
      setForm(FORM_INICIAL);
      setErroForm('');
      setTimeout(() => { setModalAberto(false); setSucesso(''); }, 2000);
    },
    onError: (e) => setErroForm(e.message),
  });

  const setCampo = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

  const salvar = () => {
    if (!form.nome.trim()) return setErroForm('Informe o nome.');
    if (!form.email.trim()) return setErroForm('Informe o e-mail.');
    if (form.senha.length < 6) return setErroForm('A senha deve ter ao menos 6 caracteres.');
    criarMutation.mutate(form);
  };

  const filtrados = funcionarios.filter(f =>
    f.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    f.matricula?.toLowerCase().includes(busca.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-4 space-y-3 bg-[#0A0B0D] min-h-full">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-[#1A1D24] border border-[#23262E] rounded-2xl p-4 h-16 animate-pulse" />
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
            placeholder="Buscar por nome ou matrícula..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#121419] border border-[#30353F] rounded-xl text-sm text-[#F5F5F0] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F08020] focus:ring-2 focus:ring-[#F08020]/30"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {['', 'eletricista', 'ajudante', 'motorista', 'supervisor', 'admin'].map(c => (
            <button key={c} onClick={() => setFiltro(c)} className={ui.chip(filtro === c)}>
              {c === '' ? 'Todos' : CARGO[c]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-2">
        <p className="text-xs text-[#6B7280]">{filtrados.length} funcionário{filtrados.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 space-y-2">
        {filtrados.map(f => (
          <div key={f.id} className="bg-[#1A1D24] rounded-2xl px-4 py-3 border border-[#23262E] flex items-center gap-3">
            <div className="w-10 h-10 bg-[#22262F] rounded-full flex items-center justify-center shrink-0">
              <IconUser size={18} className="text-[#6B7280]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#F5F5F0] text-sm truncate">{f.nome}</p>
              <p className="text-xs text-[#6B7280] truncate">{f.matricula ? `${f.matricula} · ` : ''}{f.email}</p>
            </div>
            <span className={CARGO[f.cargo]?.badge}>{CARGO[f.cargo]?.label}</span>
          </div>
        ))}
      </div>

      {/* FAB Novo funcionário (só admin) */}
      {isAdmin && (
        <button
          onClick={() => { setForm(FORM_INICIAL); setErroForm(''); setSucesso(''); setModalAberto(true); }}
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-[#F08020] shadow-[0_8px_24px_rgba(240,128,32,0.4)] flex items-center justify-center active:scale-95 transition-transform"
        >
          <IconPlus size={24} className="text-white" />
        </button>
      )}

      {/* Modal Novo funcionário */}
      <Modal aberto={modalAberto} onClose={() => setModalAberto(false)} titulo="Novo funcionário">
        <div className="space-y-4">
          {sucesso && (
            <div className="p-3 bg-[#34D399]/10 border border-[#34D399]/20 rounded-xl text-sm text-[#34D399] flex items-center gap-2">
              <IconCheck size={16} /> {sucesso}
            </div>
          )}
          {erroForm && (
            <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl text-sm text-[#F87171]">{erroForm}</div>
          )}

          <div>
            <label className={ui.label}>Nome completo *</label>
            <input value={form.nome} onChange={e => setCampo('nome', e.target.value)} placeholder="Nome do funcionário" className={ui.input} />
          </div>

          <div>
            <label className={ui.label}>E-mail (login) *</label>
            <input type="email" value={form.email} onChange={e => setCampo('email', e.target.value)} placeholder="email@mkorp.com.br" className={ui.input} />
          </div>

          <div>
            <label className={ui.label}>Senha inicial *</label>
            <input type="text" value={form.senha} onChange={e => setCampo('senha', e.target.value)} placeholder="Mínimo 6 caracteres" className={ui.input} />
            <p className="text-[11px] text-[#454A54] mt-1">O funcionário poderá alterar depois em Configurações.</p>
          </div>

          <div>
            <label className={ui.label}>Cargo</label>
            <select value={form.cargo} onChange={e => setCampo('cargo', e.target.value)} className={ui.input}>
              {CARGOS.map(c => <option key={c} value={c}>{CARGO[c]?.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={ui.label}>Matrícula</label>
              <input value={form.matricula} onChange={e => setCampo('matricula', e.target.value)} placeholder="Ex: 0012" className={ui.input} />
            </div>
            <div>
              <label className={ui.label}>Telefone</label>
              <input value={form.telefone} onChange={e => setCampo('telefone', e.target.value)} placeholder="(11) 90000-0000" className={ui.input} />
            </div>
          </div>

          <button
            onClick={salvar}
            disabled={criarMutation.isPending}
            className="w-full py-3.5 bg-[#F08020] text-white rounded-xl font-semibold text-sm active:bg-[#D86E14] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {criarMutation.isPending ? <><IconLoader2 size={16} className="animate-spin" /> Criando...</> : <><IconPlus size={16} /> Criar funcionário</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}
