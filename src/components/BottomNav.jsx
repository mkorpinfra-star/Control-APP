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
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] safe-area-bottom z-40">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                active ? 'text-[#CE0201]' : 'text-gray-500'
              }`}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                size={24}
                strokeWidth={active ? 2.5 : 2}
                className="mb-1"
              />
              <span className={`text-xs font-medium ${active ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
