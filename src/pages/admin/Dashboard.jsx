import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBuilding, IconUsers, IconBriefcase, IconClock, IconTrendingUp, IconAlertCircle } from '@tabler/icons-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/tenants/stats.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          <div className="skeleton h-8 w-64"></div>
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton h-32 w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total de Clientes',
      value: stats?.total_tenants || 0,
      icon: IconBuilding,
      color: 'bg-blue-500',
      trend: `${stats?.tenants_ativos || 0} ativos`
    },
    {
      title: 'Em Trial',
      value: stats?.tenants_trial || 0,
      icon: IconTrendingUp,
      color: 'bg-yellow-500',
      trend: `${stats?.trials_expirando || 0} expirando`
    },
    {
      title: 'Total de Usuários',
      value: stats?.total_usuarios || 0,
      icon: IconUsers,
      color: 'bg-green-500',
      trend: 'Todos os tenants'
    },
    {
      title: 'Total de Obras',
      value: stats?.total_obras || 0,
      icon: IconBriefcase,
      color: 'bg-purple-500',
      trend: 'Obras ativas'
    }
  ];

  const planDistribution = stats?.distribuicao_planos || [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral da plataforma PuntoTouch</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
                  <Icon size={24} className={`${card.color.replace('bg-', 'text-')}`} strokeWidth={2} />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
              <p className="text-xs text-gray-500">{card.trend}</p>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {(stats?.trials_expirando > 0 || stats?.licencas_expirando > 0) && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <IconAlertCircle size={24} className="text-yellow-600 shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Atenção Necessária</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {stats?.trials_expirando > 0 && (
                  <li>• {stats.trials_expirando} trial(s) expirando nos próximos 7 dias</li>
                )}
                {stats?.licencas_expirando > 0 && (
                  <li>• {stats.licencas_expirando} licença(s) expirando nos próximos 30 dias</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Two Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Distribuição por Plano</h3>
          <div className="space-y-3">
            {planDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#CE0201]"></div>
                  <span className="text-sm font-semibold text-gray-700 capitalize">{item.plan}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Growth */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Crescimento Mensal</h3>
          <div className="space-y-3">
            {stats?.crescimento_mensal?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">{item.mes}</span>
                <span className="text-sm font-bold text-gray-900">{item.total} clientes</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/tenants/create')}
            className="px-4 py-2 bg-[#CE0201] text-white rounded-xl text-sm font-semibold hover:bg-[#A00101] transition-colors"
          >
            Criar Novo Tenant
          </button>
          <button
            onClick={() => navigate('/tenants')}
            className="px-4 py-2 bg-[#F5F5F5] text-gray-900 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Ver Todos os Tenants
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="px-4 py-2 bg-[#F5F5F5] text-gray-900 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Analytics Detalhado
          </button>
        </div>
      </div>
    </div>
  );
}
