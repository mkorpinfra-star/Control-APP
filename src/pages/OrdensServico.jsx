import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordensServicoService } from '../services/supabase';
import { STATUS_OS, PRIORIDADE, ui } from '../lib/theme';
import { IconPlus, IconSearch, IconMapPin, IconAlertTriangle, IconClipboardList } from '@tabler/icons-react';

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

export default function OrdensServico() {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  const { data: ordens = [], isLoading } = useQuery({
    queryKey: ['ordens-servico', filtroStatus],
    queryFn: () => ordensServicoService.getAll({ status: filtroStatus || undefined }),
  });

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
              <div key={os.id} className="bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E]">
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
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
