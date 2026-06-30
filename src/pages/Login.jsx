import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [pressed, setPressed] = useState(false);

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
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #17191F 0%, #0E0F13 48%, #070809 100%)' }}
    >
      {/* Glow laranja sutil no topo */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(240,128,32,0.12) 0%, transparent 60%)' }} />
      {/* Glow branco fosco centro */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.025) 0%, transparent 55%)' }} />
      {/* Vinheta */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.5) 100%)' }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <img src="/logo-mkorp.png" alt="Mkorp" className="h-9 w-auto mx-auto mb-4" />
          <p className="text-[#6B7280] text-sm tracking-wide">Gestão de iluminação pública</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-sm rounded-3xl p-8 relative"
          style={{
            background: 'linear-gradient(145deg, #161920 0%, #0F1116 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Linha de brilho no topo do card */}
          <div className="absolute top-0 left-8 right-8 h-px rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(240,128,32,0.4), transparent)' }} />

          <h2 className="text-xl font-semibold text-[#F5F5F0] mb-1">Entrar</h2>
          <p className="text-sm text-[#4B5260] mb-6">Acesse com seu e-mail e senha</p>

          {erro && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl text-sm text-[#F87171]"
            >
              {erro}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-sm text-[#F5F5F0] placeholder:text-[#353A45] focus:outline-none transition"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(240,128,32,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-[#F5F5F0] placeholder:text-[#353A45] focus:outline-none transition"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(240,128,32,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#454A54] hover:text-[#A8ADB8] transition-colors"
                  tabIndex={-1}
                >
                  {mostrarSenha ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                </button>
              </div>
            </div>

            {/* Botão com gradiente e efeito */}
            <motion.button
              type="submit"
              disabled={loading}
              onTapStart={() => setPressed(true)}
              onTap={() => setPressed(false)}
              onTapCancel={() => setPressed(false)}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white mt-2 relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: pressed
                  ? 'linear-gradient(135deg, #C46010 0%, #E87420 50%, #F5A050 100%)'
                  : 'linear-gradient(135deg, #D86E14 0%, #F08020 50%, #F5963C 100%)',
                boxShadow: '0 4px 24px rgba(240,128,32,0.35)',
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
            >
              {/* Brilho interno */}
              <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
              <span className="relative z-10">{loading ? 'Entrando...' : 'Entrar'}</span>
            </motion.button>
          </form>

          <div className="mt-5 pt-4 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <a
              href="mailto:af.garcia@gmail.com?subject=Solicitação de acesso — Mkorp Control&body=Olá, gostaria de solicitar acesso ao sistema Mkorp Control.%0A%0ANome: %0ACargo: %0AEmpresa: "
              className="text-[12px] transition-colors"
              style={{ color: '#F08020' }}
            >
              Solicitar acesso
            </a>
          </div>
        </motion.div>
      </div>

      <p className="text-center text-[#2E3240] text-xs pb-6 relative z-10">
        Mkorp Control © {new Date().getFullYear()}
      </p>
    </div>
  );
}
