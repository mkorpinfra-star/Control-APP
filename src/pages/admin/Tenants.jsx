import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconSearch, IconBuilding, IconUsers, IconBriefcase, IconDots, IconPencil, IconTrash, IconPower, IconExternalLink } from '@tabler/icons-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/api';

export default function AdminTenants() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/tenants/list.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setTenants(data.tenants);
      }
    } catch (error) {
      console.error('Erro ao carregar tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(t =>
    t.nome.toLowerCase().includes(search.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (tenant) => {
    if (tenant.status === 'suspenso') {
      return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Suspenso</span>;
    }

    if (tenant.plan === 'trial') {
      const daysLeft = Math.ceil((new Date(tenant.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 0) {
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Trial Expirado</span>;
      }
      if (daysLeft <= 3) {
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Trial: {daysLeft}d</span>;
      }
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Trial</span>;
    }

    return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full capitalize">{tenant.plan}</span>;
  };

  const getPlanColor = (plan) => {
    const colors = {
      trial: 'bg-blue-500',
      starter: 'bg-green-500',
      professional: 'bg-purple-500',
      enterprise: 'bg-red-500'
    };
    return colors[plan] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          <div className="skeleton h-8 w-64"></div>
          <div className="skeleton h-12 w-full"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton h-20 w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tenants</h1>
          <p className="text-gray-600">{tenants.length} cliente(s) cadastrado(s)</p>
        </div>
        <button
          onClick={() => navigate('/tenants/create')}
          className="flex items-center gap-2 px-4 py-3 bg-[#CE0201] text-white rounded-xl font-semibold hover:bg-[#A00101] transition-all hover:scale-105 active:scale-95"
        >
          <IconPlus size={20} />
          Novo Tenant
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <IconSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, slug ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CE0201]"
          />
        </div>
      </div>

      {/* Tenants List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F5F5F5] border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Plano</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Estatísticas</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Criado em</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${getPlanColor(tenant.plan)} bg-opacity-10 rounded-xl flex items-center justify-center`}>
                        <IconBuilding size={20} className={`${getPlanColor(tenant.plan).replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{tenant.nome}</p>
                        <p className="text-sm text-gray-500">{tenant.slug}.puntoclicks.com</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(tenant)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-700 capitalize">{tenant.plan}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <IconUsers size={16} />
                        <span>{tenant.total_usuarios}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconBriefcase size={16} />
                        <span>{tenant.total_obras}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => window.open(`https://${tenant.slug}.puntoclicks.com`, '_blank')}
                        className="p-2 text-gray-600 hover:text-[#CE0201] hover:bg-red-50 rounded-lg transition-colors"
                        title="Abrir site"
                      >
                        <IconExternalLink size={18} />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <IconPencil size={18} />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Suspender/Ativar"
                      >
                        <IconPower size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTenants.length === 0 && (
          <div className="p-12 text-center">
            <IconBuilding size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-semibold">Nenhum tenant encontrado</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-2 text-sm text-[#CE0201] hover:underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
