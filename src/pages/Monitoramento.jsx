import { useQuery } from '@tanstack/react-query';
import { pontoService, ordensServicoService } from '../services/supabase';
import { IconMapPin, IconClock, IconUser, IconClipboardList } from '@tabler/icons-react';
import { STATUS_OS } from '../lib/theme';

const hoje = new Date().toISOString().split('T')[0];

export default function Monitoramento() {
  const { data: ponto = [], isLoading } = useQuery({
    queryKey: ['monitoramento-hoje'],
    queryFn: () => pontoService.getTodos({ data_inicio: hoje, data_fim: hoje }),
    refetchInterval: 15000,
  });

  const { data: ordens = [] } = useQuery({
    queryKey: ['monitoramento-os'],
    queryFn: () => ordensServicoService.getAll({}),
    refetchInterval: 20000,
    select: (lista) => lista.filter(os => (os.status === 'aberta' || os.status === 'em_andamento') && os.latitude && os.longitude),
  });

  const emCampo   = ponto.filter(p => p.hora_entrada && !p.hora_saida);
  const finalizou = ponto.filter(p => p.hora_entrada && p.hora_saida);
  const semPonto  = ponto.filter(p => !p.hora_entrada);

  if (isLoading) {
    return (
      <div className="p-4 space-y-3 bg-[#0A0B0D] min-h-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#1A1D24] border border-[#23262E] rounded-2xl p-4 h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 pt-4 space-y-4 bg-[#0A0B0D] min-h-full">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1A1D24] rounded-2xl p-3 text-center border border-[#34D399]/20">
          <p className="text-2xl font-bold text-[#34D399] tabular-nums">{emCampo.length}</p>
          <p className="text-xs text-[#34D399]/70 mt-0.5">Em campo</p>
        </div>
        <div className="bg-[#1A1D24] rounded-2xl p-3 text-center border border-[#23262E]">
          <p className="text-2xl font-bold text-[#A8ADB8] tabular-nums">{finalizou.length}</p>
          <p className="text-xs text-[#6B7280] mt-0.5">Finalizou</p>
        </div>
        <div className="bg-[#1A1D24] rounded-2xl p-3 text-center border border-[#FB8C3E]/20">
          <p className="text-2xl font-bold text-[#FB8C3E] tabular-nums">{semPonto.length}</p>
          <p className="text-xs text-[#FB8C3E]/70 mt-0.5">Sem ponto</p>
        </div>
      </div>

      {emCampo.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Em campo agora</p>
          <div className="space-y-2">
            {emCampo.map(p => (
              <div key={p.id} className="bg-[#1A1D24] rounded-2xl p-3 border border-[#34D399]/15 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#34D399]/12 rounded-full flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 bg-[#34D399] rounded-full animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#F5F5F0]">{p.usuarios?.nome}</p>
                  <p className="text-xs text-[#6B7280]">
                    {p.ordens_servico ? `OS #${p.ordens_servico.numero}` : 'Sem OS'}
                    {p.hora_entrada ? ` · desde ${p.hora_entrada}` : ''}
                  </p>
                </div>
                {p.latitude_entrada && p.longitude_entrada ? (
                  <a
                    href={`https://www.google.com/maps?q=${p.latitude_entrada},${p.longitude_entrada}`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[#34D399]/12 flex items-center justify-center shrink-0"
                    title="Ver localização de início"
                  >
                    <IconMapPin size={16} className="text-[#34D399]" />
                  </a>
                ) : (
                  <IconMapPin size={16} className="text-[#34D399]/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {ordens.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">OS georreferenciadas ({ordens.length})</p>
          <div className="space-y-2">
            {ordens.map(os => {
              const st = STATUS_OS[os.status] || STATUS_OS.aberta;
              return (
                <a
                  key={os.id}
                  href={`https://www.google.com/maps?q=${os.latitude},${os.longitude}`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-[#1A1D24] rounded-2xl p-3 border border-[#23262E] flex items-center gap-3 active:bg-[#22262F] transition-colors"
                >
                  <div className="w-8 h-8 bg-[#5B8DEF]/12 rounded-full flex items-center justify-center shrink-0">
                    <IconClipboardList size={14} className="text-[#5B8DEF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#F5F5F0]">OS #{os.numero} — {os.usuarios?.nome || 'Sem responsável'}</p>
                    <p className="text-xs text-[#6B7280] truncate">{os.bairro || os.logradouro || 'Sem endereço'}</p>
                  </div>
                  <span className={st.badge}>{st.label}</span>
                  <IconMapPin size={16} className="text-[#5B8DEF] shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {finalizou.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Finalizaram o dia</p>
          <div className="space-y-2">
            {finalizou.map(p => (
              <div key={p.id} className="bg-[#1A1D24] rounded-2xl p-3 border border-[#23262E] flex items-center gap-3">
                <div className="w-8 h-8 bg-[#22262F] rounded-full flex items-center justify-center shrink-0">
                  <IconUser size={14} className="text-[#6B7280]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#A8ADB8]">{p.usuarios?.nome}</p>
                  <p className="text-xs text-[#6B7280]">{p.hora_entrada} – {p.hora_saida} · {p.horas_normais}h</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  p.status === 'aprovado' ? 'bg-[#34D399]/12 text-[#34D399]' : 'bg-[#5B8DEF]/12 text-[#5B8DEF]'
                }`}>
                  {p.status === 'aprovado' ? 'Aprovado' : 'Enviado'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {ponto.length === 0 && (
        <div className="text-center py-16 text-[#6B7280]">
          <IconClock size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum funcionário com ponto hoje</p>
        </div>
      )}
    </div>
  );
}
