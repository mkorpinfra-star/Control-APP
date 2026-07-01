import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { notificacoesService } from '../services/supabase';
import { IconBell, IconX, IconClipboardList, IconInfoCircle, IconChecks } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

function tempoRelativo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export default function NotificacoesSino() {
  const { perfil } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [aberto, setAberto] = useState(false);

  const { data: naoLidas = 0 } = useQuery({
    queryKey: ['notif-count', perfil?.id],
    queryFn: () => notificacoesService.contarNaoLidas(perfil.id),
    enabled: !!perfil?.id,
    refetchInterval: 20000,
  });

  const { data: lista = [] } = useQuery({
    queryKey: ['notif-lista', perfil?.id],
    queryFn: () => notificacoesService.getByUsuario(perfil.id),
    enabled: !!perfil?.id && aberto,
  });

  const marcarLida = useMutation({
    mutationFn: (id) => notificacoesService.marcarLida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notif-count', perfil?.id] });
      queryClient.invalidateQueries({ queryKey: ['notif-lista', perfil?.id] });
    },
  });

  const marcarTodas = useMutation({
    mutationFn: () => notificacoesService.marcarTodasLidas(perfil.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notif-count', perfil?.id] });
      queryClient.invalidateQueries({ queryKey: ['notif-lista', perfil?.id] });
    },
  });

  const abrirNotif = (n) => {
    if (!n.lida) marcarLida.mutate(n.id);
    if (n.link) { setAberto(false); navigate(n.link); }
  };

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="relative w-10 h-10 rounded-full bg-[#1A1D24] border border-[#30353F] flex items-center justify-center text-[#A8ADB8] hover:text-[#F5F5F0] hover:bg-[#22262F] transition-colors"
        aria-label="Notificações"
      >
        <IconBell stroke={1.5} size={20} />
        {naoLidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#F08020] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0A0B0D]">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      <AnimatePresence>
        {aberto && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50" onClick={() => setAberto(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-[#0A0B0D] border-l border-[#23262E] z-50 flex flex-col"
            >
              <div className="p-4 border-b border-[#23262E] flex items-center justify-between safe-area-top">
                <p className="font-semibold text-[#F5F5F0]">Notificações</p>
                <div className="flex items-center gap-2">
                  {lista.some(n => !n.lida) && (
                    <button onClick={() => marcarTodas.mutate()} className="text-xs text-[#5B8DEF] flex items-center gap-1">
                      <IconChecks size={14} /> Marcar todas
                    </button>
                  )}
                  <button onClick={() => setAberto(false)} className="w-8 h-8 rounded-full bg-[#1A1D24] border border-[#30353F] flex items-center justify-center text-[#A8ADB8]">
                    <IconX size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {lista.length === 0 ? (
                  <div className="text-center py-16 text-[#6B7280]">
                    <IconBell size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhuma notificação</p>
                  </div>
                ) : (
                  lista.map(n => {
                    const Icon = n.tipo === 'os' ? IconClipboardList : IconInfoCircle;
                    return (
                      <button
                        key={n.id}
                        onClick={() => abrirNotif(n)}
                        className={`w-full text-left rounded-2xl p-3 border flex gap-3 transition-colors ${n.lida ? 'bg-[#121419] border-[#23262E]' : 'bg-[#F08020]/8 border-[#F08020]/25'}`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.lida ? 'bg-[#22262F]' : 'bg-[#F08020]/15'}`}>
                          <Icon size={17} className={n.lida ? 'text-[#6B7280]' : 'text-[#F08020]'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium ${n.lida ? 'text-[#A8ADB8]' : 'text-[#F5F5F0]'}`}>{n.titulo}</p>
                            {!n.lida && <span className="w-2 h-2 rounded-full bg-[#F08020] shrink-0 mt-1.5" />}
                          </div>
                          {n.mensagem && <p className="text-xs text-[#6B7280] mt-0.5">{n.mensagem}</p>}
                          <p className="text-[10px] text-[#454A54] mt-1">{tempoRelativo(n.criado_em)}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
