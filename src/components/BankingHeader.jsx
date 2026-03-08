import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IconLogout } from '@tabler/icons-react';
import ProfileMenu from './ProfileMenu';

export default function BankingHeader() {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getSystemTitle = () => {
    if (user?.tipo === 'admin') return 'Painel de Administração';
    if (user?.tipo === 'encarregado') return 'Painel do Supervisor';
    return 'Painel do Funcionário';
  };

  const getUserInitials = () => {
    if (!user?.nome) return 'U';
    const names = user.nome.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.nome.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="bg-gradient-to-br from-[#CE0201] to-[#A00101] text-white safe-area-top">
        <div className="px-4 pt-6 pb-8">
          {/* Top Row - Avatar Clicável + Logout */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Avatar com Notificação - Clicável */}
              <button
                onClick={() => setShowProfileMenu(true)}
                className="relative group"
              >
                {user?.foto_url && user.foto_url.trim() !== '' && !imageError ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 group-hover:border-white/50 transition-all">
                    <img
                      src={`https://j2s.ad${user.foto_url}`}
                      alt={user?.nome}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 group-hover:border-white/50 transition-all">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                )}
                {/* Bolinha de notificação branca */}
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white rounded-full border-2 border-[#CE0201]"></div>
              </button>

              {/* Greeting */}
              <div>
                <p className="text-sm opacity-90">{getGreeting()},</p>
                <p className="text-lg font-semibold">
                  {user?.nome?.split(' ')[0] || 'Usuário'}
                </p>
              </div>
            </div>

            {/* Botão de Logout */}
            <button
              onClick={logout}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Cerrar sesión"
            >
              <IconLogout size={20} />
            </button>
          </div>

          {/* Account Info */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <p className="text-xs opacity-80 mb-1">J2S Hores by PuntoClicks.com</p>
            <p className="text-lg font-bold tracking-tight">
              {getSystemTitle()}
            </p>
          </div>
        </div>
      </header>

      {/* Profile Menu Lateral */}
      <ProfileMenu
        isOpen={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
      />
    </>
  );
}
