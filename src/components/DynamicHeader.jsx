import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  IconLogout, IconPlus, IconClipboardList, IconPackage,
  IconUsers, IconFileText, IconChartBar, IconSettings,
  IconUserCircle, IconMapPin, IconTruck, IconBuilding,
  IconClipboardCheck, IconClock, IconArrowLeft, IconHistory
} from '@tabler/icons-react';
import ProfileMenu from './ProfileMenu';
import Avatar from './Avatar';
import NotificacoesSino from './NotificacoesSino';

export default function DynamicHeader() {
  const { perfil, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getPageConfig = () => {
    const path = location.pathname;

    if (path === '/' || path === '/dashboard') {
      return { type: 'dashboard', showQuickActions: true };
    }

    const configs = {
      '/ordens-servico':  { type: 'list', title: 'Ordens de serviço', subtitle: 'Gestão de OS', icon: IconClipboardList, addAction: () => window.dispatchEvent(new CustomEvent('openAddModal', { detail: { page: 'ordens-servico' } })) },
      '/contratos':       { type: 'list', title: 'Contratos', subtitle: 'Prefeituras e municípios', icon: IconBuilding, addAction: () => window.dispatchEvent(new CustomEvent('openAddModal', { detail: { page: 'contratos' } })) },
      '/funcionarios':    { type: 'list', title: 'Funcionários', subtitle: 'Equipes de campo', icon: IconUsers, addAction: () => window.dispatchEvent(new CustomEvent('openAddModal', { detail: { page: 'funcionarios' } })) },
      '/almoxarifado':    { type: 'list', title: 'Almoxarifado', subtitle: 'Estoque de materiais', icon: IconPackage, addAction: () => window.dispatchEvent(new CustomEvent('openAddModal', { detail: { page: 'almoxarifado' } })) },
      '/requisicoes':     { type: 'page', title: 'Requisições', subtitle: 'Saída de materiais', icon: IconPackage },
      '/controle-ponto':  { type: 'page', title: 'Controle de ponto', subtitle: 'Jornada dos funcionários', icon: IconClock },
      '/aprovacoes':      { type: 'page', title: 'Aprovações', subtitle: 'Pendências de revisão', icon: IconClipboardCheck },
      '/monitoramento':   { type: 'page', title: 'Monitoramento', subtitle: 'Equipes em campo', icon: IconTruck },
      '/relatorios':      { type: 'page', title: 'Relatórios', subtitle: 'Medição e desempenho', icon: IconChartBar },
      '/medicao':         { type: 'page', title: 'Medição', subtitle: 'Faturamento por contrato', icon: IconFileText },
      '/auditoria':       { type: 'page', title: 'Auditoria', subtitle: 'Histórico de ações', icon: IconFileText },
      '/configuracoes':   { type: 'page', title: 'Configurações', subtitle: 'Ajustes do sistema', icon: IconSettings },
      '/bater-ponto':     { type: 'page', title: 'Registro de ponto', subtitle: 'Sua jornada de hoje' },
      '/registro-campo':  { type: 'page', title: 'Registro de campo', subtitle: 'OS em execução', icon: IconMapPin },
    };

    return configs[path] || { type: 'simple', title: 'Mkorp Control', subtitle: 'Iluminação Pública' };
  };

  const config = getPageConfig();

  const quickActions = [
    { label: 'Ordens de serviço', icon: IconClipboardList, path: '/ordens-servico' },
    { label: 'Contratos',         icon: IconBuilding,      path: '/contratos' },
    { label: 'Funcionários',      icon: IconUsers,         path: '/funcionarios' },
    { label: 'Almoxarifado',      icon: IconPackage,       path: '/almoxarifado' },
    { label: 'Requisições',       icon: IconFileText,      path: '/requisicoes' },
    { label: 'Ponto',             icon: IconClock,         path: '/controle-ponto' },
    { label: 'Aprovações',        icon: IconClipboardCheck,path: '/aprovacoes' },
    { label: 'Monitoramento',     icon: IconTruck,         path: '/monitoramento' },
    { label: 'Relatórios',        icon: IconChartBar,      path: '/relatorios' },
    { label: 'Auditoria',        icon: IconHistory,       path: '/auditoria' },
    { label: 'Config.',           icon: IconSettings,      path: '/configuracoes' },
  ];

  const isAdmin = perfil?.cargo === 'admin';
  const homePath = isAdmin ? '/dashboard'
    : perfil?.cargo === 'supervisor' ? '/aprovacoes'
    : perfil?.cargo === 'almoxarife' ? '/almoxarifado'
    : '/bater-ponto';
  const isHome = location.pathname === homePath || location.pathname === '/';

  return (
    <>
      <header className={`text-[#F5F5F0] safe-area-top border-b border-[#23262E] ${
        config.showQuickActions
          ? 'bg-[linear-gradient(160deg,#1B2436_0%,#121419_45%,#0A0B0D_100%)]'
          : 'bg-gradient-to-b from-[#15171C] to-[#0A0B0D]'
      }`}>
        <div className={`px-4 pt-6 ${isAdmin ? 'pb-6' : 'pb-3'}`}>
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowProfileMenu(true)} className="relative group">
                <div className="border border-[#30353F] group-hover:border-[#F08020]/50 transition-all rounded-full">
                  <Avatar user={perfil} size="md" className="!bg-[#22262F] !text-[#F5F5F0]" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#34D399] rounded-full border-2 border-[#0A0B0D]" />
              </button>
              <div>
                <p className="text-sm text-[#A8ADB8]">{getGreeting()},</p>
                <p className="text-lg font-semibold text-[#F5F5F0]">
                  {perfil?.nome?.split(' ')[0] || 'Usuário'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NotificacoesSino />
              {isHome ? (
                <button
                  onClick={logout}
                  className="w-10 h-10 rounded-full bg-[#1A1D24] border border-[#30353F] flex items-center justify-center text-[#A8ADB8] hover:text-[#F5F5F0] hover:bg-[#22262F] transition-colors"
                  aria-label="Sair"
                >
                  <IconLogout stroke={1.5} size={20} />
                </button>
              ) : (
                <button
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 rounded-full bg-[#1A1D24] border border-[#30353F] flex items-center justify-center text-[#A8ADB8] hover:text-[#F5F5F0] hover:bg-[#22262F] transition-colors"
                  aria-label="Voltar"
                >
                  <IconArrowLeft stroke={1.5} size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Título de página (não dashboard) */}
          {!config.showQuickActions && isAdmin && (
            <div className="bg-[#1A1D24] backdrop-blur-md rounded-2xl p-4 border border-[#23262E]">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-[#6B7280] mb-1">{config.subtitle}</p>
                  <p className="text-xl tracking-tight font-normal text-[#F5F5F0]">{config.title}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions — Dashboard admin */}
          {config.showQuickActions && isAdmin && (
            <div className="grid grid-cols-5 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform group"
                  >
                    <div className="w-12 h-12 bg-[#1A1D24] border border-[#23262E] rounded-xl flex items-center justify-center group-hover:border-[#F08020]/40 group-hover:bg-[#22262F] transition-colors">
                      <Icon stroke={1.5} size={22} className="text-[#A8ADB8] group-hover:text-[#5B8DEF] transition-colors" />
                    </div>
                    <span className="text-[10px] font-medium text-center leading-tight text-[#A8ADB8]">{action.label}</span>
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
