import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { comentariosService } from '../services/supabase';
import { FotoCapturaGaleria } from './FotoCaptura';
import { IconSend, IconPhoto, IconX } from '@tabler/icons-react';

function iniciais(nome = '') {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export default function ComentariosOS({ osId }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [texto, setTexto] = useState('');
  const [foto, setFoto] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const { data: comentarios = [], isLoading } = useQuery({
    queryKey: ['comentarios-os', osId],
    queryFn: () => comentariosService.getByOS(osId),
    refetchInterval: 15000,
  });

  const enviar = async () => {
    if (!texto.trim() && !foto) return;
    setEnviando(true);
    try {
      let foto_url = null;
      if (foto?.file) foto_url = await comentariosService.uploadFoto(foto.file);
      await comentariosService.create(osId, user.id, texto.trim(), foto_url);
      setTexto('');
      setFoto(null);
      qc.invalidateQueries({ queryKey: ['comentarios-os', osId] });
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-[#A8ADB8] uppercase tracking-wider">Mensagens</h3>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-14 bg-[#1A1D24] rounded-2xl animate-pulse" />)}
        </div>
      ) : comentarios.length === 0 ? (
        <p className="text-sm text-[#454A54] text-center py-6">Nenhuma mensagem ainda</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {comentarios.map(c => {
            const ehMeu = c.usuario_id === user.id;
            return (
              <div key={c.id} className={`flex gap-2 ${ehMeu ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-full bg-[#F08020]/20 flex items-center justify-center text-[10px] font-bold text-[#F08020] shrink-0">
                  {iniciais(c.usuarios?.nome)}
                </div>
                <div className={`max-w-[80%] ${ehMeu ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <span className="text-[10px] text-[#454A54]">{c.usuarios?.nome}</span>
                  {c.foto_url && (
                    <img src={c.foto_url} alt="foto" className="rounded-xl max-w-full max-h-40 object-cover border border-[#23262E]" />
                  )}
                  {c.texto && (
                    <div className={`px-3 py-2 rounded-2xl text-sm text-[#F5F5F0] ${ehMeu ? 'bg-[#F08020]/20 rounded-tr-sm' : 'bg-[#1A1D24] border border-[#23262E] rounded-tl-sm'}`}>
                      {c.texto}
                    </div>
                  )}
                  <span className="text-[9px] text-[#454A54]">
                    {new Date(c.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {foto && (
        <div className="relative w-20">
          <img src={foto.url} alt="preview" className="w-20 h-20 object-cover rounded-xl border border-[#30353F]" />
          <button onClick={() => setFoto(null)} className="absolute -top-1 -right-1 w-5 h-5 bg-[#F87171] rounded-full flex items-center justify-center">
            <IconX size={10} className="text-white" />
          </button>
        </div>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1 bg-[#121419] border border-[#30353F] rounded-2xl px-3 py-2 focus-within:border-[#F08020] transition-colors">
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva uma mensagem..."
            rows={1}
            className="w-full bg-transparent text-sm text-[#F5F5F0] placeholder:text-[#454A54] resize-none focus:outline-none"
          />
        </div>
        <FotoCapturaGaleria onFoto={setFoto} label="" />
        <button
          onClick={enviar}
          disabled={enviando || (!texto.trim() && !foto)}
          className="w-10 h-10 bg-[#F08020] rounded-2xl flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-[#D86E14] transition-colors"
        >
          <IconSend size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}
