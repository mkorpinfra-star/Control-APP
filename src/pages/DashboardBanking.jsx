import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, CheckCircle, AlertCircle, Bell, Briefcase, Building2, UserPlus, ShieldPlus, Edit, XCircle } from 'lucide-react';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { obrasService, apontamentosService } from '../services/api';
import { notificacoesService } from '../services/notificacoes';

export default function DashboardBanking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [stats, setStats] = useState({
    obrasAtivas: 0,
    apontamentosPendentes: 0,
    obrasFinalizadas: 0,
    alertas: 0
  });
  const [notificacoes, setNotificacoes] = useState([]);

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

      // Obras finalizadas = 0 (por enquanto não temos campo de finalização explícita)
      const obrasFinalizadas = 0;

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

      // Alertas: obras sem encarregado + apontamentos pendentes há mais de 7 dias
      const obrasSemEncarregado = obrasAtivas.filter(o => !o.encarregado_id);
      const apontamentosAtrasados = pendentes.filter(a => {
        if (!a.created_at) return false;
        const dias = Math.floor((Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24));
        return dias > 7;
      });

      console.log('📊 STATS FINAIS:', {
        obrasAtivas: obrasAtivas.length,
        pendentes: pendentes.length,
        finalizadas: 0,
        alertas: obrasSemEncarregado.length + apontamentosAtrasados.length
      });

      setStats({
        obrasAtivas: obrasAtivas.length,
        apontamentosPendentes: pendentes.length,
        obrasFinalizadas: 0,
        alertas: obrasSemEncarregado.length + apontamentosAtrasados.length
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatClick = (statId) => {
    switch(statId) {
      case 'active':
        navigate('/projects'); // Vai para obras
        break;
      case 'pending':
        navigate('/approvals'); // Vai para aprovações pendentes
        break;
      case 'completed':
        navigate('/projects'); // Vai para obras (poderá filtrar finalizadas)
        break;
      case 'alerts':
        navigate('/projects'); // Vai para obras (poderá ver alertas)
        break;
    }
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
      'briefcase': Briefcase,
      'edit': Edit,
      'check-circle': CheckCircle,
      'building-2': Building2,
      'user-plus': UserPlus,
      'shield-plus': ShieldPlus,
      'clock': Clock,
      'x-circle': XCircle,
      'bell': Bell
    };
    return icons[iconName] || Bell;
  };

  const getColorClass = (color) => {
    const colors = {
      'blue': 'bg-blue-100 text-blue-600',
      'green': 'bg-green-100 text-green-600',
      'red': 'bg-red-100 text-red-600',
      'orange': 'bg-orange-100 text-orange-600',
      'gray': 'bg-gray-100 text-gray-600'
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  const formatTimeAgo = (created_at) => {
    const date = new Date(created_at);
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
      icon: TrendingUp,
      color: 'text-black',
      bgColor: 'bg-gray-100'
    },
    {
      id: 'pending',
      label: 'Aprobaciones Pendientes',
      value: stats.apontamentosPendentes,
      icon: Clock,
      color: 'text-black',
      bgColor: 'bg-gray-100'
    },
    {
      id: 'completed',
      label: 'Finalizadas',
      value: stats.obrasFinalizadas,
      icon: CheckCircle,
      color: 'text-black',
      bgColor: 'bg-gray-100'
    },
    {
      id: 'alerts',
      label: 'Alertas',
      value: stats.alertas,
      icon: AlertCircle,
      color: 'text-black',
      bgColor: 'bg-gray-100'
    }
  ];

  return (
    <div className="h-full pb-6">
      {/* Stats Grid */}
      <div className="px-4 mb-6 pt-6">
        <h2 className="text-lg font-bold mb-4 text-gray-900">Resumen</h2>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton h-28 rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {statsConfig.map((stat) => {
              const Icon = stat.icon;
              return (
                <button
                  key={stat.id}
                  onClick={() => handleStatClick(stat.id)}
                  className="bg-[#F5F5F5] rounded-2xl p-5 text-left hover:bg-gray-200 transition-colors active:scale-95"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} ${stat.color} flex items-center justify-center shrink-0`}>
                      <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 leading-none">
                      {stat.value}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
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
              <div key={i} className="skeleton h-20 rounded-2xl"></div>
            ))}
          </div>
        ) : notificacoes.length === 0 ? (
          <div className="bg-[#F5F5F5] rounded-2xl p-8 text-center">
            <Bell size={48} className="mx-auto text-gray-400 mb-3" />
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
                      <IconComponent size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {notif.titulo}
                        </p>
                        <span className="text-xs text-gray-500 shrink-0">
                          {formatTimeAgo(notif.created_at)}
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
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3 text-gray-900 px-4">Descubra más</h2>

        {/* Carrossel Horizontal com Scroll Suave */}
        <div className="overflow-x-auto hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex gap-3 px-4 pb-2">
            {/* Card 1: Gestão de Obras */}
            <div className="flex-shrink-0 w-72 bg-[#F5F5F5] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=180&fit=crop&auto=format&q=80"
                alt="Gestión de obras"
                className="w-full h-32 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1.5 text-base">Gestión completa de obras</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Controle proyectos, empleados y facturación.
                </p>
              </div>
            </div>

            {/* Card 2: Registro de Horas */}
            <div className="flex-shrink-0 w-72 bg-[#F5F5F5] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=180&fit=crop&auto=format&q=80"
                alt="Registro de horas"
                className="w-full h-32 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1.5 text-base">Registro de horas simplificado</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Empleados registran horas con geolocalización.
                </p>
              </div>
            </div>

            {/* Card 3: Informes */}
            <div className="flex-shrink-0 w-72 bg-[#F5F5F5] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=180&fit=crop&auto=format&q=80"
                alt="Informes y análisis"
                className="w-full h-32 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1.5 text-base">Informes detallados</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Analice costos, facturación y rentabilidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
