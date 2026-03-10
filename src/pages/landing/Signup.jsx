import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBuilding, IconUser, IconMail, IconLock, IconPhone, IconAlertCircle, IconCheck } from '@tabler/icons-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/api';

export default function LandingSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Dados da empresa
    company_name: '',
    company_slug: '',
    company_email: '',
    company_phone: '',

    // Dados do admin
    admin_name: '',
    admin_email: '',
    admin_password: '',
    admin_password_confirm: '',

    // Plano
    plan: 'trial'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-gerar slug quando digitar nome da empresa
    if (field === 'company_name' && step === 1) {
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

    if (step === 1) {
      if (!formData.company_name || !formData.company_slug) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (formData.admin_password !== formData.admin_password_confirm) {
        setError('As senhas não coincidem');
        return;
      }
      if (formData.admin_password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres');
        return;
      }
      setStep(3);
      return;
    }

    // Step 3 - Enviar para o backend
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/tenants/create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Erro ao criar conta. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#CE0201] to-[#A00101] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconCheck size={32} className="text-green-600" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Conta Criada com Sucesso!</h2>
          <p className="text-gray-600 mb-6">
            Sua conta foi criada. Você será redirecionado para o login em instantes...
          </p>
          <p className="text-sm text-gray-500">
            Acesse: <strong>{formData.company_slug}.puntoclicks.com</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CE0201] to-[#A00101] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-white rounded-xl"></div>
            <span className="text-3xl font-bold text-white">PuntoClicks</span>
          </div>
          <p className="text-white text-opacity-90">Crie sua conta - 14 dias grátis</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(num => (
            <div key={num} className={`h-2 rounded-full transition-all ${num <= step ? 'w-16 bg-white' : 'w-8 bg-white bg-opacity-30'}`}></div>
          ))}
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                <IconAlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-semibold">{error}</p>
              </div>
            )}

            {/* Step 1: Dados da Empresa */}
            {step === 1 && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Dados da Empresa</h2>
                  <p className="text-sm text-gray-600 mt-1">Passo 1 de 3</p>
                </div>

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
                    Seu endereço será: <strong>{formData.company_slug || 'seu-slug'}.puntoclicks.com</strong>
                  </p>
                </div>

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
              </>
            )}

            {/* Step 2: Dados do Administrador */}
            {step === 2 && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Dados do Administrador</h2>
                  <p className="text-sm text-gray-600 mt-1">Passo 2 de 3</p>
                </div>

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
                      placeholder="Seu nome completo"
                      className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CE0201]"
                    />
                  </div>
                </div>

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
                      placeholder="seu@email.com"
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <IconLock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={formData.admin_password_confirm}
                      onChange={(e) => handleChange('admin_password_confirm', e.target.value)}
                      required
                      placeholder="Repita a senha"
                      className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CE0201]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Escolher Plano */}
            {step === 3 && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Escolha seu Plano</h2>
                  <p className="text-sm text-gray-600 mt-1">Passo 3 de 3</p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'trial', name: 'Trial', price: 'Grátis', period: '14 dias', desc: 'Até 5 funcionários, 2 obras' },
                    { id: 'starter', name: 'Starter', price: '€49', period: '/mês', desc: 'Até 20 funcionários, 10 obras' },
                    { id: 'professional', name: 'Professional', price: '€99', period: '/mês', desc: 'Ilimitado' }
                  ].map(plan => (
                    <label key={plan.id} className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.plan === plan.id ? 'border-[#CE0201] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        checked={formData.plan === plan.id}
                        onChange={(e) => handleChange('plan', e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{plan.name}</p>
                          <p className="text-sm text-gray-600">{plan.desc}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{plan.price}</p>
                          <p className="text-sm text-gray-600">{plan.period}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 px-4 bg-[#F5F5F5] text-gray-900 rounded-xl font-semibold text-base hover:bg-gray-200 transition-colors"
                >
                  Voltar
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-[#CE0201] text-white rounded-xl font-semibold text-base hover:bg-[#A00101] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Criando...' : step === 3 ? 'Criar Conta' : 'Próximo'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <button onClick={() => navigate('/login')} className="text-[#CE0201] font-semibold hover:underline">
                Fazer login
              </button>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button onClick={() => navigate('/')} className="text-sm text-white hover:underline">
            ← Voltar para home
          </button>
        </div>
      </div>
    </div>
  );
}
