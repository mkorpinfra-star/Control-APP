import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconTrendingUp, IconClock, IconUsers, IconUserCircle, IconBell, IconBriefcase, IconBuildingFactory2, IconUserPlus, IconShieldPlus, IconEdit, IconCircleX, IconCircleCheck } from '@tabler/icons-react';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { obrasService, apontamentosService, clientesService, usuariosService } from '../services/api';
import { notificacoesService } from '../services/notificacoes';
import TourGuide from '../components/TourGuide';
import { SkeletonStatCard, SkeletonNotificationCard } from '../components/SkeletonLoader';

export default function DashboardBanking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [stats, setStats] = useState({
    obrasAtivas: 0,
    apontamentosPendentes: 0,
    clientes: 0,
    empleados: 0
  });
  const [notificacoes, setNotificacoes] = useState([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);

  // Auto-refresh: refetch quando volta ao app ou reconecta
  useAutoRefresh(['dashboard'], {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    loadDashboardData();
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await notificacoesService.getAll({ limit: 10 });
      setNotificacoes(response.notificacoes || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar obras (obrasService.getAll() já retorna array direto)
      const obras = await obrasService.getAll();
      console.log('✅ Obras carregadas:', obras);
      console.log('✅ Tipo de obras:', typeof obras, Array.isArray(obras));

      // Garantir que é array
      const obrasArray = Array.isArray(obras) ? obras : [];
      console.log('✅ ObrasArray length:', obrasArray.length);

      // Obras ativas (ativo=1 ou ativa=1)
      const obrasAtivas = obrasArray.filter(o => {
        console.log(`Obra ${o.numero}: ativo=${o.ativo}, ativa=${o.ativa}`);
        return o.ativo === 1 || o.ativa === 1;
      });
      console.log('✅ Obras ativas filtradas:', obrasAtivas.length);

      // Buscar clientes
      const clientesRes = await clientesService.getAll();
      const clientes = Array.isArray(clientesRes) ? clientesRes : (clientesRes.clientes || []);
      console.log('✅ Clientes carregados:', clientes.length);

      // Buscar funcionários (empleados) - tipo 'funcionario'
      const funcionariosRes = await usuariosService.getAll('funcionario');
      const funcionarios = Array.isArray(funcionariosRes) ? funcionariosRes : (funcionariosRes.usuarios || []);
      console.log('✅ Funcionários carregados:', funcionarios.length);

      // Buscar apontamentos pendentes
      const apontRes = await apontamentosService.getAll();
      console.log('✅ Apontamentos response:', apontRes);
      console.log('✅ Tipo de apontRes:', typeof apontRes, Array.isArray(apontRes));

      const apontamentos = Array.isArray(apontRes) ? apontRes : (apontRes.apontamentos || []);
      console.log('✅ Apontamentos array length:', apontamentos.length);

      // Apontamentos pendentes de aprovação
      const pendentes = apontamentos.filter(a => {
        const isPendente = a.status === 'pendente' || a.status === 'pendente_aprovacao';
        if (isPendente) console.log('Apontamento pendente:', a.id, a.status);
        return isPendente;
      });
      console.log('✅ Apontamentos pendentes:', pendentes.length);

      console.log('📊 STATS FINAIS:', {
        obrasAtivas: obrasAtivas.length,
        pendentes: pendentes.length,
        clientes: clientes.length,
        empleados: funcionarios.length
      });

      setStats({
        obrasAtivas: obrasAtivas.length,
        apontamentosPendentes: pendentes.length,
        clientes: clientes.length,
        empleados: funcionarios.length
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const infoContent = {
    active: {
      title: 'Obres Actives',
      description: 'Totes les teves obres en marxa, en un sol lloc.',
      benefits: [
        'Adéu paperassa!',
        'Control total en temps real',
        'Assigna encarregats al instant',
        'Veu estat i progressos d\'un cop d\'ull'
      ],
      cta: 'Gestionar Obres',
      action: () => navigate('/projects')
    },
    pending: {
      title: 'Aprovacions Pendents',
      description: 'Revisa i aprova hores en segons, no en hores.',
      benefits: [
        'Adéu planilhas!',
        'Aprovació amb un clic',
        'Histórico complet de cada empleat',
        'Integració automàtica amb folha de pagament'
      ],
      cta: 'Revisar Aprovacions',
      action: () => navigate('/approvals')
    },
    clients: {
      title: 'Clientes',
      description: 'Tota la teva cartera de clients en un sol lloc.',
      benefits: [
        'Adéu fulls de càlcul desorganitzats!',
        'Contactes actualitzats sempre',
        'Veu totes les obres per client',
        'Gestió ràpida i professional'
      ],
      cta: 'Gestionar Clients',
      action: () => navigate('/clients')
    },
    employees: {
      title: 'Empleados',
      description: 'Gestió completa de la teva plantilla.',
      benefits: [
        'Fitxes completes de cada empleat',
        'Control de salaris i CASS',
        'Assignació a obres en segons',
        'Tot centralitzat, zero confusió'
      ],
      cta: 'Gestionar Empleats',
      action: () => navigate('/employees')
    }
  };

  const handleStatClick = (statId) => {
    // Navegação direta para Clientes e Empleados
    if (statId === 'clients') {
      navigate('/clients');
      return;
    }
    if (statId === 'employees') {
      navigate('/employees');
      return;
    }

    // Para outros cards, mostra modal informativo
    setSelectedInfo(infoContent[statId]);
    setShowInfoModal(true);
  };

  const handleNotificationClick = async (notificacao) => {
    // Marcar como lida
    try {
      await notificacoesService.markAsRead(notificacao.id);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }

    // Navegar para a URL
    if (notificacao.url) {
      navigate(notificacao.url);
    }
  };

  const getIconComponent = (iconName) => {
    const icons = {
      'briefcase': IconBriefcase,
      'edit': IconEdit,
      'check-circle': IconCircleCheck,
      'building-2': IconBuildingFactory2,
      'user-plus': IconUserPlus,
      'shield-plus': IconShieldPlus,
      'clock': IconClock,
      'x-circle': IconCircleX,
      'bell': IconBell
    };
    return icons[iconName] || IconBell;
  };

  const getColorClass = (color) => {
    // Sempre retorna fundo cinza neutro com ícone preto
    return 'bg-gray-100 text-black';
  };

  const formatTimeAgo = (created_at) => {
    if (!created_at) return '—';
    const date = new Date(created_at);
    if (isNaN(date.getTime())) return '—';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays}d`;
  };

  const statsConfig = [
    {
      id: 'active',
      label: 'Obras Activas',
      value: stats.obrasAtivas,
      icon: IconTrendingUp,
      color: 'text-black',
      bgColor: 'bg-gray-100'
    },
    {
      id: 'pending',
      label: 'Aprobaciones Pendientes',
      value: stats.apontamentosPendentes,
      icon: IconClock,
      color: 'text-black',
      bgColor: 'bg-gray-100'
    },
    {
      id: 'clients',
      label: 'Clientes',
      value: stats.clientes,
      icon: IconUsers,
      color: 'text-black',
      bgColor: 'bg-gray-100'
    },
    {
      id: 'employees',
      label: 'Empleados',
      value: stats.empleados,
      icon: IconUserCircle,
      color: 'text-black',
      bgColor: 'bg-gray-100'
    }
  ];

  return (
    <div className="h-full overflow-y-auto pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Stats Grid - Ícones compactos lado a lado */}
      <div id="stats-section" className="px-4 mb-6 pt-6">
        <h2 className="text-lg font-bold mb-4 text-gray-900">Resumen</h2>

        {loading ? (
          <div className="grid grid-cols-4 gap-3">
            {[1,2,3,4].map(i => (
              <SkeletonStatCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {statsConfig.map((stat) => {
              const Icon = stat.icon;
              return (
                <button
                  key={stat.id}
                  onClick={() => handleStatClick(stat.id)}
                  className="bg-[#F5F5F5] rounded-xl p-3 flex flex-col items-center justify-start hover:bg-gray-200 transition-colors active:scale-95 min-h-[100px]"
                >
                  <Icon size={28} stroke={1} className="text-gray-900 mb-2 mt-1" />
                  <p className="text-2xl font-bold text-gray-900 leading-none mb-1">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-gray-600 text-center leading-tight">
                    {stat.label}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Actividad reciente</h2>
        </div>

        {loadingNotifications ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <SkeletonNotificationCard key={i} />
            ))}
          </div>
        ) : notificacoes.length === 0 ? (
          <div className="bg-[#F5F5F5] rounded-2xl p-8 text-center">
            <IconBell size={48} stroke={1} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 text-sm">
              No hay actividad reciente
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Las acciones del sistema aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notificacoes.map((notif) => {
              const IconComponent = getIconComponent(notif.icone);
              const colorClass = getColorClass(notif.cor);

              return (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full bg-[#F5F5F5] rounded-2xl p-4 text-left hover:bg-gray-200 transition-colors active:scale-[0.98] ${notif.lida ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center shrink-0`}>
                      <IconComponent size={20} stroke={1} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {notif.titulo}
                        </p>
                        <span className="text-xs text-gray-500 shrink-0">
                          {formatTimeAgo(notif.criado_em)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notif.mensagem}
                      </p>
                      {notif.usuario_nome && (
                        <p className="text-xs text-gray-500 mt-1">
                          por {notif.usuario_nome}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Descubra más - Carrossel Horizontal Estilo Nubank */}
      {/* OCULTO TEMPORARIAMENTE - manter código para uso futuro */}
      <div className="mb-8 px-4 hidden">
        <h2 className="text-lg font-bold mb-4 text-gray-900">Descobreix més</h2>

        {/* Carrossel Horizontal com Scroll Suave */}
        <div className="overflow-x-auto hide-scrollbar -mx-4 px-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex gap-3 pb-2">
            {/* Card 1: Gestão de Obras */}
            <button
              onClick={() => navigate('/guide/projects')}
              className="flex-shrink-0 w-72 bg-[#F5F5F5] rounded-2xl overflow-hidden text-left hover:bg-gray-200 transition-colors active:scale-[0.98]"
            >
              <img
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=180&fit=crop&auto=format&q=80"
                alt="Gestió d'obres"
                className="w-full h-32 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1.5 text-base">Gestió completa d'obres</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  Controla projectes, empleats i facturació.
                </p>
                <span className="text-xs text-[#CE0201] font-semibold">Més informació →</span>
              </div>
            </button>

            {/* Card 2: Registro de Horas */}
            <button
              onClick={() => navigate('/guide/timesheet')}
              className="flex-shrink-0 w-72 bg-[#F5F5F5] rounded-2xl overflow-hidden text-left hover:bg-gray-200 transition-colors active:scale-[0.98]"
            >
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=180&fit=crop&auto=format&q=80"
                alt="Registre d'hores"
                className="w-full h-32 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1.5 text-base">Registre d'hores simplificat</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  Empleats registren hores amb geolocalització.
                </p>
                <span className="text-xs text-[#CE0201] font-semibold">Més informació →</span>
              </div>
            </button>

            {/* Card 3: Informes */}
            <button
              onClick={() => navigate('/guide/analytics')}
              className="flex-shrink-0 w-72 bg-[#F5F5F5] rounded-2xl overflow-hidden text-left hover:bg-gray-200 transition-colors active:scale-[0.98]"
            >
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=180&fit=crop&auto=format&q=80"
                alt="Informes i anàlisi"
                className="w-full h-32 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1.5 text-base">Informes detallats</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  Analitza costos, facturació i rentabilitat.
                </p>
                <span className="text-xs text-[#CE0201] font-semibold">Més informació →</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tour Tutorial */}
      <TourGuide />

      {/* Info Modal */}
      {showInfoModal && selectedInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowInfoModal(false)}>
          <div
            className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl transform transition-all"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-[#CE0201] to-[#A00101] px-6 py-8 text-white">
              <h3 className="text-2xl mb-2" style={{ fontFamily: 'IBM Plex Sans', fontWeight: 400 }}>
                {selectedInfo.title}
              </h3>
              <p className="text-white/90 text-sm leading-relaxed">
                {selectedInfo.description}
              </p>
            </div>

            {/* Benefits */}
            <div className="px-6 py-6 space-y-3">
              {selectedInfo.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowInfoModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setShowInfoModal(false);
                  selectedInfo.action();
                }}
                className="flex-1 px-4 py-3 bg-[#CE0201] text-white rounded-xl font-medium hover:bg-[#A00101] transition-colors"
              >
                {selectedInfo.cta}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
