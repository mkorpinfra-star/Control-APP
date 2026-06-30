import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '../services/supabase';
import { CARGO, ui } from '../lib/theme';
import { IconSearch, IconPlus, IconUser } from '@tabler/icons-react';

export default function Funcionarios() {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('');

  const { data: funcionarios = [], isLoading } = useQuery({
    queryKey: ['funcionarios', filtro],
    queryFn: () => usuariosService.getAll(filtro || null),
  });

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
          {['', 'eletricista', 'ajudante', 'motorista', 'supervisor'].map(c => (
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
              <p className="text-xs text-[#6B7280]">{f.matricula} · {f.email}</p>
            </div>
            <span className={CARGO[f.cargo]?.badge}>{CARGO[f.cargo]?.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
