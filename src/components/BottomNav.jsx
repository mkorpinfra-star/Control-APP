import { Home, Briefcase, Users, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'home',
      label: 'Início',
      icon: Home,
      path: '/dashboard',
      activePaths: ['/dashboard', '/']
    },
    {
      id: 'projects',
      label: 'Obras',
      icon: Briefcase,
      path: '/projects',
      activePaths: ['/projects', '/resumo-obra']
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: Users,
      path: '/clients',
      activePaths: ['/clients']
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: User,
      path: '/settings',
      activePaths: ['/settings']
    }
  ];

  const isActive = (item) => {
    return item.activePaths.some(path => location.pathname === path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 safe-area-bottom z-40 pb-4 px-4 pointer-events-none">
      <nav className="bg-white rounded-3xl shadow-lg border border-gray-200 max-w-md mx-auto pointer-events-auto">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative"
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <div className="absolute top-2 w-10 h-10 bg-red-50 rounded-full" />
                )}
                <Icon
                  size={24}
                  strokeWidth={active ? 2.5 : 2}
                  className={`mb-1 relative z-10 transition-colors ${
                    active ? 'text-[#CE0201]' : 'text-gray-500'
                  }`}
                />
                <span className={`text-xs font-medium relative z-10 ${active ? 'font-semibold text-[#CE0201]' : 'font-normal text-gray-500'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
