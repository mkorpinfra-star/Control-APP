import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pontoService } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { STATUS_PONTO } from '../lib/theme';
import { IconCheck, IconX, IconClock } from '@tabler/icons-react';

export default function ControlePonto() {
  const { isAdmin, isSupervisor } = useAuth();
  const queryClient = useQueryClient();

  const { data: registros = [], isLoading } = useQuery({
    queryKey: ['todos-ponto'],
    queryFn: () => pontoService.getTodos({ status: isAdmin || isSupervisor ? undefined : 'enviado' }),
  });

  const aprovarMut = useMutation({
    mutationFn: pontoService.aprovar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos-ponto'] }),
  });
  const rejeitarMut = useMutation({
    mutationFn: ({ id, motivo }) => pontoService.rejeitar(id, motivo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos-ponto'] }),
  });

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
    <div className="pb-32 px-4 pt-4 space-y-3 bg-[#0A0B0D] min-h-full">
      {registros.length === 0 && (
        <div className="text-center py-16 text-[#6B7280]">
          <IconClock size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum registro de ponto</p>
        </div>
      )}
      {registros.map(r => {
        const st = STATUS_PONTO[r.status] || STATUS_PONTO.rascunho;
        return (
          <div key={r.id} className="bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E]">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-[#F5F5F0] text-sm">{r.usuarios?.nome}</p>
                <p className="text-xs text-[#6B7280] capitalize">{r.usuarios?.cargo}</p>
              </div>
              <span className={st.badge}>{st.label}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#A8ADB8] mb-1">
              <span>{new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
              {r.hora_entrada && <span>{r.hora_entrada}{r.hora_saida ? ` – ${r.hora_saida}` : ''}</span>}
            </div>
            {(r.horas_normais > 0 || r.horas_extras > 0) && (
              <p className="text-xs text-[#6B7280]">
                {r.horas_normais}h normais{r.horas_extras > 0 ? ` + ${r.horas_extras}h extras` : ''}
              </p>
            )}
            {r.status === 'enviado' && (isAdmin || isSupervisor) && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-[#23262E]">
                <button
                  onClick={() => aprovarMut.mutate(r.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#34D399]/10 border border-[#34D399]/20 text-[#34D399] rounded-xl text-xs font-medium active:bg-[#34D399]/20"
                >
                  <IconCheck size={14} /> Aprovar
                </button>
                <button
                  onClick={() => {
                    const motivo = window.prompt('Motivo da rejeição:');
                    if (motivo) rejeitarMut.mutate({ id: r.id, motivo });
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#F87171]/10 border border-[#F87171]/20 text-[#F87171] rounded-xl text-xs font-medium active:bg-[#F87171]/20"
                >
                  <IconX size={14} /> Rejeitar
                </button>
              </div>
            )}
            {r.status === 'rejeitado' && r.motivo_rejeicao && (
              <p className="text-xs text-[#F87171] mt-2">Motivo: {r.motivo_rejeicao}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
