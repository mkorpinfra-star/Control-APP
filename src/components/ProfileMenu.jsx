import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IconUser, IconLock, IconWorld, IconInfoCircle, IconLogout, IconX } from '@tabler/icons-react';

export default function ProfileMenu({ isOpen, onClose }) {
  const { perfil, logout } = useAuth();

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const CARGO_LABEL = {
    admin: 'Administrador', supervisor: 'Supervisor',
    eletricista: 'Eletricista', ajudante: 'Ajudante', motorista: 'Motorista',
  };

  const item = (Icon, titulo, sub, onClick, danger = false) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors text-left ${
        danger ? 'active:bg-[#F87171]/10' : 'active:bg-[#272B35]'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${danger ? 'bg-[#F87171]/12' : 'bg-[#22262F]'}`}>
        <Icon size={18} className={danger ? 'text-[#F87171]' : 'text-[#A8ADB8]'} />
      </div>
      <div className="flex-1">
        <p className={`font-semibold text-sm ${danger ? 'text-[#F87171]' : 'text-[#F5F5F0]'}`}>{titulo}</p>
        {sub && <p className="text-xs text-[#6B7280]">{sub}</p>}
      </div>
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      <div
        className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-[#0A0B0D] border-l border-[#23262E] z-50 shadow-2xl"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s' }}
      >
        {/* Header */}
        <div className="bg-[linear-gradient(160deg,#1B2436_0%,#121419_60%,#0A0B0D_100%)] p-6 pb-8 border-b border-[#23262E] safe-area-top">
          <div className="flex items-start justify-between mb-6">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#1A1D24] border border-[#30353F] flex items-center justify-center text-[#A8ADB8] active:bg-[#22262F] transition-colors"
            >
              <IconX size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#F08020]/12 border border-[#30353F] flex items-center justify-center">
              <IconUser size={32} strokeWidth={1.5} className="text-[#5B8DEF]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#F5F5F0]">{perfil?.nome}</p>
              <p className="text-xs text-[#6B7280]">{perfil?.email}</p>
              <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-[#F08020]/15 text-[#5B8DEF]">
                {CARGO_LABEL[perfil?.cargo] || perfil?.cargo}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-1">
          {item(IconLock, 'Alterar senha', 'Mantenha sua conta segura', () => alert('Disponível ao conectar o Supabase.'))}
          {item(IconWorld, 'Idioma', 'Português (Brasil)', () => {})}
          {item(IconInfoCircle, 'Sobre', 'Mkorp Control v1.0 · protótipo', () => alert('Mkorp Control\nGestão de iluminação pública\nv1.0 (protótipo)'))}

          <div className="h-px bg-[#23262E] my-3" />

          {item(IconLogout, 'Sair da conta', null, logout, true)}
        </div>
      </div>
    </>
  );
}
