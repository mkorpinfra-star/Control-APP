import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { contratosService } from '../services/supabase';
import { STATUS_CONTRATO, ui } from '../lib/theme';
import { IconPlus, IconSearch, IconBuilding, IconMapPin } from '@tabler/icons-react';

const STATUS_LABEL = { ativo: 'Ativo', encerrado: 'Encerrado', suspenso: 'Suspenso' };

export default function Contratos() {
  const [busca, setBusca] = useState('');

  const { data: contratos = [], isLoading } = useQuery({
    queryKey: ['contratos'],
    queryFn: contratosService.getAll,
  });

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
            <div key={c.id} className="bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E]">
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
            </div>
          ))
        )}
      </div>

    </div>
  );
}
