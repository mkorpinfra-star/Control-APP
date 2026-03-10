import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBuilding, IconUser, IconMail, IconLock, IconPhone, IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/api';

export default function AdminCreateTenant() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    company_name: '',
    company_slug: '',
    company_email: '',
    company_phone: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    plan: 'trial'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-gerar slug
    if (field === 'company_name') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, company_slug: slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/tenants/create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: formData.company_name,
          slug: formData.company_slug,
          email: formData.company_email,
          telefone: formData.company_phone,
          admin_nome: formData.admin_name,
          admin_email: formData.admin_email,
          admin_password: formData.admin_password,
          plan: formData.plan
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        navigate('/tenants');
      } else {
        setError(data.message || 'Erro ao criar tenant');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/tenants')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <IconArrowLeft size={20} />
          Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Novo Tenant</h1>
        <p className="text-gray-600">Cadastre um novo cliente na plataforma</p>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <IconAlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-semibold">{error}</p>
            </div>
          )}

          {/* Dados da Empresa */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Dados da Empresa</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome da Empresa *
                </label>
                <div className="relative">
                  <IconBuilding size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    required
                    placeholder="Ex: Construções Silva"
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CE0201]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Identificador (slug) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.company_slug}
                    onChange={(e) => handleChange('company_slug', e.target.value)}
                    required
                    placeholder="ex: construcoes-silva"
                    className="w-full px-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CE0201]"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  URL: <strong>{formData.company_slug || 'slug'}.puntoclicks.com</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email da Empresa
                  </label>
                  <div className="relative">
                    <IconMail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.company_email}
                      onChange={(e) => handleChange('company_email', e.target.value)}
                      placeholder="contato@empresa.com"
                      className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CE0201]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <IconPhone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.company_phone}
                      onChange={(e) => handleChange('company_phone', e.target.value)}
                      placeholder="+376 XXX XXX"
                      className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CE0201]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dados do Administrador */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Administrador</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <div className="relative">
                  <IconUser size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.admin_name}
                    onChange={(e) => handleChange('admin_name', e.target.value)}
                    required
                    placeholder="Nome do administrador"
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CE0201]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <IconMail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.admin_email}
                      onChange={(e) => handleChange('admin_email', e.target.value)}
                      required
                      placeholder="admin@empresa.com"
                      className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CE0201]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Senha *
                  </label>
                  <div className="relative">
                    <IconLock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={formData.admin_password}
                      onChange={(e) => handleChange('admin_password', e.target.value)}
                      required
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CE0201]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plano */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Plano</h2>

            <div className="grid grid-cols-4 gap-3">
              {[
                { id: 'trial', name: 'Trial', desc: '14 dias grátis' },
                { id: 'starter', name: 'Starter', desc: '€49/mês' },
                { id: 'professional', name: 'Professional', desc: '€99/mês' },
                { id: 'enterprise', name: 'Enterprise', desc: 'Personalizado' }
              ].map(plan => (
                <label
                  key={plan.id}
                  className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.plan === plan.id
                      ? 'border-[#CE0201] bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    checked={formData.plan === plan.id}
                    onChange={(e) => handleChange('plan', e.target.value)}
                    className="sr-only"
                  />
                  <p className="font-bold text-gray-900 mb-1">{plan.name}</p>
                  <p className="text-xs text-gray-600">{plan.desc}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/tenants')}
              className="flex-1 py-3 px-4 bg-[#F5F5F5] text-gray-900 rounded-xl font-semibold text-base hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-[#CE0201] text-white rounded-xl font-semibold text-base hover:bg-[#A00101] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Criando...' : 'Criar Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
