import { IconBriefcase, IconUsers, IconUserCircle, IconChartBar, IconFileText, IconSettings, IconCurrencyDollar, IconReceipt, IconUserCog, IconActivity, IconShieldPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'clients',
      label: 'Clientes',
      icon: IconUsers,
      path: '/clients',
      color: 'bg-[#F5F5F5] text-black'
    },
    {
      id: 'projects',
      label: 'Obras',
      icon: IconBriefcase,
      path: '/projects',
      color: 'bg-[#F5F5F5] text-black'
    },
    {
      id: 'employees',
      label: 'Empleados',
      icon: IconUserCircle,
      path: '/employees',
      color: 'bg-[#F5F5F5] text-black'
    },
    {
      id: 'encarregados',
      label: 'Encargados',
      icon: IconUserCog,
      path: '/encarregados',
      color: 'bg-[#F5F5F5] text-black'
    },
    {
      id: 'admins',
      label: 'Admins',
      icon: IconShieldPlus,
      path: '/administradores',
      color: 'bg-[#F5F5F5] text-black'
    },
    {
      id: 'payroll',
      label: 'Folha',
      icon: IconCurrencyDollar,
      path: '/payroll',
      color: 'bg-[#F5F5F5] text-black'
    },
    {
      id: 'billing',
      label: 'Faturamento',
      icon: IconReceipt,
      path: '/billing',
      color: 'bg-[#F5F5F5] text-black'
    },
    {
      id: 'monitoreo',
      label: 'Monitoreo',
      icon: IconActivity,
      path: '/monitoramento',
      color: 'bg-[#F5F5F5] text-black'
    },
    {
      id: 'reports',
      label: 'Informes',
      icon: IconFileText,
      path: '/reports',
      color: 'bg-[#F5F5F5] text-black'
    },
    {
      id: 'analytics',
      label: 'Análisis',
      icon: IconChartBar,
      path: '/analytics',
      color: 'bg-[#F5F5F5] text-black'
    }
  ];

  return (
    <div className="px-4 py-6">
      <h2 className="text-lg font-bold mb-4 text-gray-900">Acceso rápido</h2>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 min-w-[80px] group"
            >
              <div className={`w-16 h-16 rounded-2xl ${action.color} flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95`}>
                <Icon size={28} strokeWidth={2} />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
