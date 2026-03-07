import { Home, Briefcase, Users, Settings, ClipboardCheck, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getNavItemsByRole = () => {
    if (user?.tipo === 'funcionario') {
      return [
        {
          id: 'ponto',
          icon: Clock,
          path: '/bater-ponto',
          activePaths: ['/bater-ponto']
        },
        {
          id: 'historico',
          icon: ClipboardCheck,
          path: '/timesheet',
          activePaths: ['/timesheet']
        }
      ];
    }

    if (user?.tipo === 'encarregado') {
      return [
        {
          id: 'aprovacoes',
          icon: ClipboardCheck,
          path: '/approvals',
          activePaths: ['/approvals']
        }
      ];
    }

    // Admin vê tudo
    return [
      {
        id: 'home',
        icon: Home,
        path: '/dashboard',
        activePaths: ['/dashboard', '/']
      },
      {
        id: 'projects',
        icon: Briefcase,
        path: '/projects',
        activePaths: ['/projects', '/resumo-obra']
      },
      {
        id: 'clients',
        icon: Users,
        path: '/clients',
        activePaths: ['/clients']
      },
      {
        id: 'settings',
        icon: Settings,
        path: '/settings',
        activePaths: ['/settings']
      }
    ];
  };

  const navItems = getNavItemsByRole();

  const isActive = (item) => {
    return item.activePaths.some(path => location.pathname === path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 safe-area-bottom z-50 pb-4 px-4 pointer-events-none">
      <nav className="bg-white rounded-3xl shadow-sm max-w-md mx-auto pointer-events-auto mb-4">
        <div className="flex items-center justify-around h-14 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="flex items-center justify-center w-12 h-12 transition-all duration-200 relative"
                aria-label={item.id}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <div className="absolute inset-0 bg-red-50 rounded-full" />
                )}
                <Icon
                  size={26}
                  strokeWidth={active ? 2.5 : 2}
                  className={`relative z-10 transition-colors ${
                    active ? 'text-[#CE0201]' : 'text-gray-500'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
