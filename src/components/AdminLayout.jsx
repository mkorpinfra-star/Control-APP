import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IconBuilding, IconChartBar, IconUsers, IconLogout, IconDashboard } from '@tabler/icons-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: IconDashboard, label: 'Dashboard' },
    { path: '/tenants', icon: IconBuilding, label: 'Tenants' },
    { path: '/analytics', icon: IconChartBar, label: 'Analytics' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    window.location.href = 'https://puntoclicks.com/login';
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-[#CE0201] rounded-xl"></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">PuntoClicks</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#CE0201] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} strokeWidth={2} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#CE0201] bg-opacity-10 rounded-full flex items-center justify-center">
              <IconUsers size={20} className="text-[#CE0201]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.nome}</p>
              <p className="text-xs text-gray-500 truncate">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <IconLogout size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
