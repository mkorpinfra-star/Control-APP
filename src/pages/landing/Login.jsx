import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { IconMail, IconLock, IconAlertCircle } from '@tabler/icons-react';

export default function LandingLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);

      if (result.success) {
        // Login centralizado redireciona automaticamente para o subdomain correto
        // O AuthContext já faz isso no método login()
      } else {
        setError(result.error || 'Email ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CE0201] to-[#A00101] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-white rounded-xl"></div>
            <span className="text-3xl font-bold text-white">PuntoClicks</span>
          </div>
          <p className="text-white text-opacity-90">Faça login para continuar</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                <IconAlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-semibold">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <IconMail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CE0201]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <IconLock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CE0201]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#CE0201] text-white rounded-xl font-semibold text-base hover:bg-[#A00101] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Ainda não tem conta?{' '}
              <button onClick={() => navigate('/signup')} className="text-[#CE0201] font-semibold hover:underline">
                Começar grátis
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
