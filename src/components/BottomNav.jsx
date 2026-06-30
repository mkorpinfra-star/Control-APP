import {
  IconHome, IconClipboardList, IconPackage,
  IconClipboardCheck, IconClock, IconMapPin,
  IconTruck, IconChartBar
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isSupervisor, isFuncionario } = useAuth();

  const getNavItems = () => {
    if (isFuncionario) {
      return [
        { id: 'ponto',       label: 'Ponto',     icon: IconClock,   path: '/bater-ponto' },
        { id: 'campo',       label: 'Campo',     icon: IconMapPin,  path: '/registro-campo' },
        { id: 'requisicoes', label: 'Materiais', icon: IconPackage, path: '/requisicoes' },
      ];
    }
    if (isSupervisor) {
      return [
        { id: 'aprovacoes',    label: 'Aprovar',  icon: IconClipboardCheck, path: '/aprovacoes' },
        { id: 'ordens',        label: 'Ordens',   icon: IconClipboardList,  path: '/ordens-servico' },
        { id: 'monitoramento', label: 'Campo',    icon: IconTruck,          path: '/monitoramento' },
      ];
    }
    return [
      { id: 'home',         label: 'Início',      icon: IconHome,          path: '/dashboard' },
      { id: 'ordens',       label: 'Ordens',      icon: IconClipboardList, path: '/ordens-servico' },
      { id: 'almoxarifado', label: 'Estoque',     icon: IconPackage,       path: '/almoxarifado' },
      { id: 'relatorios',   label: 'Relatórios',  icon: IconChartBar,      path: '/relatorios' },
    ];
  };

  const navItems = getNavItems();
  const isActive = (item) => location.pathname === item.path;

  return (
    <div id="bottom-nav" className="fixed bottom-0 inset-x-0 z-50 pb-4 px-4 pointer-events-none safe-area-bottom">
      <nav className="bg-[#121419]/95 backdrop-blur-lg border border-[#23262E] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-md mx-auto pointer-events-auto">
        <div className="flex items-stretch justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center justify-center gap-1 flex-1 transition-colors"
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <span className="absolute top-2 w-8 h-0.5 rounded-full bg-[#F08020]" />
                )}
                <Icon
                  size={22}
                  stroke={1.6}
                  className={active ? 'text-[#F08020]' : 'text-[#6B7280]'}
                />
                <span className={`text-[10px] font-medium ${active ? 'text-[#F08020]' : 'text-[#6B7280]'}`}>
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
