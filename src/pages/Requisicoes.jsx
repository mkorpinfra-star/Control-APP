import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requisicoesService } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { STATUS_REQ, ui } from '../lib/theme';
import { IconPackage, IconCheck, IconX, IconPlus } from '@tabler/icons-react';

export default function Requisicoes() {
  const { isAdmin, isSupervisor, perfil } = useAuth();
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState('pendente');

  const { data: requisicoes = [], isLoading } = useQuery({
    queryKey: ['requisicoes', filtro],
    queryFn: () => requisicoesService.getAll({
      status: filtro || undefined,
      usuario_id: (!isAdmin && !isSupervisor) ? perfil?.id : undefined,
    }),
  });

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

    </div>
  );
}
