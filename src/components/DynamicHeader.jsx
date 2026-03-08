import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconLogout, IconPlus, IconBuilding, IconBuildingFactory2, IconUserPlus, IconShieldPlus, IconUsers, IconFileText, IconCurrencyDollar, IconChartBar, IconSettings, IconUserCircle, IconReceipt, IconUserCog } from '@tabler/icons-react';
import ProfileMenu from './ProfileMenu';

export default function DynamicHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getUserInitials = () => {
    if (!user?.nome) return 'U';
    const names = user.nome.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.nome.substring(0, 2).toUpperCase();
  };

  // Configuração de cada página
  const getPageConfig = () => {
    const path = location.pathname;

    // Dashboard - mostra QuickActions
    if (path === '/' || path === '/dashboard') {
      return {
        type: 'dashboard',
        showQuickActions: true
      };
    }

    // Páginas com botão de adicionar
    const pageConfigs = {
      '/projects': {
        type: 'list',
        title: 'Proyectos',
        subtitle: 'Gestión de obras',
        icon: IconBuilding,
        addAction: () => navigate('/projects?add=true')
      },
      '/clients': {
        type: 'list',
        title: 'Clientes',
        subtitle: 'Gestión de clientes',
        icon: IconBuildingFactory2,
        addAction: () => navigate('/clients?add=true')
      },
      '/encarregados': {
        type: 'list',
        title: 'Encargados',
        subtitle: 'Gestión de encargados',
        icon: IconShieldPlus,
        addAction: () => navigate('/encarregados?add=true')
      },
      '/employees': {
        type: 'list',
        title: 'Empleados',
        subtitle: 'Gestión de empleados',
        icon: IconUsers,
        addAction: () => navigate('/employees?add=true')
      },
      '/approvals': {
        type: 'page',
        title: 'Aprobaciones',
        subtitle: 'Registros pendientes',
        icon: IconFileText
      },
      '/payroll': {
        type: 'page',
        title: 'Nómina',
        subtitle: 'Folha de pagamento',
        icon: IconCurrencyDollar
      },
      '/billing': {
        type: 'page',
        title: 'Facturación',
        subtitle: 'Faturamento',
        icon: IconFileText
      },
      '/analytics': {
        type: 'page',
        title: 'Analíticas',
        subtitle: 'Informes y estadísticas',
        icon: IconChartBar
      },
      '/settings': {
        type: 'page',
        title: 'Configuración',
        subtitle: 'Ajustes del sistema',
        icon: IconSettings
      }
    };

    return pageConfigs[path] || {
      type: 'simple',
      title: user?.tipo === 'admin' ? 'Painel' : 'Painel',
      subtitle: 'J2S Hores'
    };
  };

  const config = getPageConfig();

  // TODOS os QuickActions (8 itens) - Folha ao lado DIREITO de Informes
  const quickActions = [
    { label: 'Obras', icon: IconBuilding, path: '/projects', tourId: 'obras-btn' },
    { label: 'Clientes', icon: IconUsers, path: '/clients', tourId: 'clientes-btn' },
    { label: 'Encargados', icon: IconUserCog, path: '/encarregados', tourId: 'encargados-btn' },
    { label: 'Empleados', icon: IconUserCircle, path: '/employees', tourId: 'empleados-btn' },
    { label: 'Faturamento', icon: IconReceipt, path: '/billing', tourId: 'faturamento-btn' },
    { label: 'Análisis', icon: IconChartBar, path: '/analytics', tourId: 'analisis-btn' },
    { label: 'Informes', icon: IconFileText, path: '/reports', tourId: 'informes-btn' },
    { label: 'Folha', icon: IconCurrencyDollar, path: '/payroll', tourId: 'folha-btn' }
  ];

  return (
    <>
      <header className="bg-gradient-to-br from-[#CE0201] to-[#A00101] text-white safe-area-top">
        <div className="px-4 pt-6 pb-6">
          {/* Top Row - Avatar + Logout */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowProfileMenu(true)} className="relative group">
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
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white rounded-full border-2 border-[#CE0201]"></div>
              </button>

              <div>
                <p className="text-sm opacity-90">{getGreeting()},</p>
                <p className="text-lg font-semibold">
                  {user?.nome?.split(' ')[0] || 'Usuário'}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Cerrar sesión"
            >
              <IconLogout stroke={1} size={20} />
            </button>
          </div>

          {/* Title Section - Só para páginas que NÃO são Dashboard */}
          {!config.showQuickActions && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs opacity-80 mb-1">{config.subtitle}</p>
                  <p className="text-xl tracking-tight" style={{ fontFamily: 'IBM Plex Sans', fontWeight: 400 }}>{config.title}</p>
                </div>

                {/* Botão de adicionar para páginas de lista */}
                {config.type === 'list' && config.addAction && (
                  <button
                    onClick={config.addAction}
                    className="w-12 h-12 bg-white text-[#CE0201] rounded-full hover:bg-white/90 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg ml-3 shrink-0"
                  >
                    <IconPlus stroke={1} size={24} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions - só aparece no Dashboard - Grid 5 colunas x 2 linhas */}
          {config.showQuickActions && (
            <div id="quick-actions" className="grid grid-cols-5 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    data-tour={action.tourId}
                    className="flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity active:scale-95"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Icon stroke={1} size={24} />
                    </div>
                    <span className="text-[10px] font-medium text-center leading-tight">{action.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      <ProfileMenu
        isOpen={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
      />
    </>
  );
}
