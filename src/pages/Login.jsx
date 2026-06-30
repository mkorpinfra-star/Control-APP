import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IconEye, IconEyeOff } from '@tabler/icons-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !senha) return setErro('Preencha e-mail e senha.');

    setLoading(true);
    setErro('');

    const resultado = await login(email, senha);

    if (!resultado.success) {
      setErro(resultado.message);
      setLoading(false);
    }
    // Se ok, o AuthContext atualiza e redireciona via TenantRoutes
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #17191F 0%, #0E0F13 48%, #070809 100%)' }}
    >
      {/* Brilho fosco sutil no centro-topo */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 36%, rgba(255,255,255,0.03) 0%, transparent 55%)' }} />
      {/* Vinheta nas bordas */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 45%, transparent 55%, rgba(0,0,0,0.45) 100%)' }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 relative z-10">
        {/* Logo */}
        <div className="mb-10 text-center">
          <img
            src="/logo-mkorp.png"
            alt="Mkorp"
            className="h-9 w-auto mx-auto mb-4"
          />
          <p className="text-[#6B7280] text-sm">Gestão de iluminação pública</p>
        </div>

        {/* Card de login */}
        <div className="w-full max-w-sm bg-[#121419] border border-[#23262E] rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] p-8">
          <h2 className="text-xl font-semibold text-[#F5F5F0] mb-1">Entrar</h2>
          <p className="text-sm text-[#6B7280] mb-6">Acesse com seu e-mail e senha</p>

          {erro && (
            <div className="mb-4 p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl text-sm text-[#F87171]">
              {erro}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A8ADB8] mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full px-4 py-3 bg-[#0A0B0D] border border-[#30353F] rounded-xl text-sm text-[#F5F5F0] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F08020] focus:ring-2 focus:ring-[#F08020]/30 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A8ADB8] mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 bg-[#0A0B0D] border border-[#30353F] rounded-xl text-sm text-[#F5F5F0] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F08020] focus:ring-2 focus:ring-[#F08020]/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#A8ADB8] transition-colors"
                  tabIndex={-1}
                >
                  {mostrarSenha ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#F08020] text-[#F5F5F0] rounded-xl font-semibold text-sm hover:bg-[#D86E14] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Dica de credenciais (protótipo) */}
          <div className="mt-5 pt-4 border-t border-[#23262E]">
            <p className="text-[11px] text-[#6B7280] text-center">
              Protótipo · admin@mkorp.com.br · senha 123456
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-[#454A54] text-xs pb-6 relative z-10">
        Mkorp Control © {new Date().getFullYear()}
      </p>
    </div>
  );
}
