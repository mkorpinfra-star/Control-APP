import { useState, useEffect } from 'react';
import { IconTrendingUp, IconUsers, IconBuilding, IconClock, IconChartBar } from '@tabler/icons-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/api';

export default function AdminAnalytics() {
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
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton h-48 w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const apontamentosStatus = stats?.apontamentos_por_status || [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Análises detalhadas da plataforma</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-xl flex items-center justify-center">
              <IconBuilding size={24} className="text-blue-500" strokeWidth={2} />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Total de Clientes</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.total_tenants || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 bg-opacity-10 rounded-xl flex items-center justify-center">
              <IconUsers size={24} className="text-green-500" strokeWidth={2} />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Total de Usuários</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.total_usuarios || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 bg-opacity-10 rounded-xl flex items-center justify-center">
              <IconChartBar size={24} className="text-purple-500" strokeWidth={2} />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Total de Obras</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.total_obras || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500 bg-opacity-10 rounded-xl flex items-center justify-center">
              <IconClock size={24} className="text-yellow-500" strokeWidth={2} />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Total de Apontamentos</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.total_apontamentos || 0}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Apontamentos por Status */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Apontamentos por Status</h3>
          <div className="space-y-3">
            {apontamentosStatus.map((item, index) => {
              const colors = {
                pendente: { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' },
                aprovado: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
                rejeitado: { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' }
              };
              const color = colors[item.status] || { bg: 'bg-gray-100', text: 'text-gray-700', bar: 'bg-gray-500' };
              const percentage = stats?.total_apontamentos > 0 ? (item.total / stats.total_apontamentos * 100) : 0;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-semibold capitalize ${color.text}`}>{item.status}</span>
                    <span className="text-sm font-bold text-gray-900">{item.total}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${color.bar}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribuição por Plano */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Distribuição por Plano</h3>
          <div className="space-y-3">
            {stats?.distribuicao_planos?.map((item, index) => {
              const colors = {
                trial: { bg: 'bg-blue-500' },
                starter: { bg: 'bg-green-500' },
                professional: { bg: 'bg-purple-500' },
                enterprise: { bg: 'bg-red-500' }
              };
              const color = colors[item.plan] || { bg: 'bg-gray-500' };
              const percentage = stats?.total_tenants > 0 ? (item.total / stats.total_tenants * 100) : 0;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 capitalize">{item.plan}</span>
                    <span className="text-sm font-bold text-gray-900">{item.total}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${color.bg}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Crescimento Mensal */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Crescimento Mensal (Últimos 6 Meses)</h3>
        <div className="space-y-4">
          {stats?.crescimento_mensal?.map((item, index) => {
            const maxValue = Math.max(...(stats.crescimento_mensal?.map(m => m.total) || [1]));
            const percentage = (item.total / maxValue * 100);

            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">{item.mes}</span>
                  <span className="text-sm font-bold text-gray-900">{item.total} cliente(s)</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#CE0201]" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <h3 className="text-sm font-semibold opacity-90 mb-1">Clientes Ativos</h3>
          <p className="text-4xl font-bold">{stats?.tenants_ativos || 0}</p>
          <p className="text-sm opacity-75 mt-2">
            {stats?.total_tenants > 0 ? Math.round(stats.tenants_ativos / stats.total_tenants * 100) : 0}% do total
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
          <h3 className="text-sm font-semibold opacity-90 mb-1">Em Trial</h3>
          <p className="text-4xl font-bold">{stats?.tenants_trial || 0}</p>
          <p className="text-sm opacity-75 mt-2">{stats?.trials_expirando || 0} expirando em 7 dias</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
          <h3 className="text-sm font-semibold opacity-90 mb-1">Suspensos</h3>
          <p className="text-4xl font-bold">{stats?.tenants_suspensos || 0}</p>
          <p className="text-sm opacity-75 mt-2">Requer atenção</p>
        </div>
      </div>
    </div>
  );
}
