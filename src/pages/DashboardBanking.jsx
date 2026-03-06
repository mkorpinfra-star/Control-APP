import QuickActions from '../components/QuickActions';
import { TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function DashboardBanking() {
  // Mock data - você vai substituir com dados reais da API
  const stats = [
    {
      id: 'active',
      label: 'Obras Activas',
      value: '12',
      icon: TrendingUp,
      color: 'text-black',
      bgColor: 'bg-gray-100'
    },
    {
      id: 'pending',
      label: 'Pendentes',
      value: '5',
      icon: Clock,
      color: 'text-black',
      bgColor: 'bg-gray-100'
    },
    {
      id: 'completed',
      label: 'Finalizadas',
      value: '28',
      icon: CheckCircle,
      color: 'text-black',
      bgColor: 'bg-gray-100'
    },
    {
      id: 'alerts',
      label: 'Alertas',
      value: '3',
      icon: AlertCircle,
      color: 'text-black',
      bgColor: 'bg-gray-100'
    }
  ];

  return (
    <div className="pb-8">
      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Grid */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold mb-4 text-gray-900">Resumen</h2>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="bg-[#F5F5F5] rounded-2xl p-4"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} ${stat.color} flex items-center justify-center mb-3`}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-600">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Actividad reciente</h2>
          <button className="text-sm font-medium text-[#CE0201]">
            Ver todo
          </button>
        </div>

        <div className="space-y-3">
          {/* Activity Item */}
          <div className="bg-[#F5F5F5] rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  Nueva obra creada
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Casa Amanda e Henrique - Em andamento
                </p>
                <p className="text-xs text-gray-400 mt-1">Hace 2 horas</p>
              </div>
            </div>
          </div>

          {/* Activity Item */}
          <div className="bg-[#F5F5F5] rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={18} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  Horas aprobadas
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  15 horas aprobadas para Juan Pérez
                </p>
                <p className="text-xs text-gray-400 mt-1">Hace 3 horas</p>
              </div>
            </div>
          </div>

          {/* Activity Item */}
          <div className="bg-[#F5F5F5] rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={18} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  Informe generado
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Informe mensual de obras - Enero 2026
                </p>
                <p className="text-xs text-gray-400 mt-1">Hace 5 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
