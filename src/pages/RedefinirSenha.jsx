import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

// Destino do link "Esqueci minha senha" enviado por e-mail.
// O supabase-js troca o token do link por uma sessão de recuperação; aqui o usuário define a nova senha.
export default function RedefinirSenha() {
  const [pronto, setPronto] = useState(false);
  const [invalido, setInvalido] = useState(false);
  const [senha, setSenha] = useState('');
  const [senha2, setSenha2] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let ativo = true;
    const { data: sub } = supabase.auth.onAuthStateChange((evento, sessao) => {
      if (!ativo) return;
      if (evento === 'PASSWORD_RECOVERY' || (sessao && evento === 'SIGNED_IN')) setPronto(true);
    });
    // O link pode já ter sido processado antes deste efeito montar
    supabase.auth.getSession().then(({ data }) => { if (ativo && data.session) setPronto(true); });
    const t = setTimeout(() => { if (ativo) setInvalido(v => v || !document.location.hash.includes('access_token') && !document.location.search.includes('code=')); }, 4000);
    return () => { ativo = false; clearTimeout(t); sub?.subscription?.unsubscribe(); };
  }, []);

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    if (senha.length < 8) return setErro('A senha deve ter ao menos 8 caracteres.');
    if (senha !== senha2) return setErro('As senhas não conferem.');
    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);
    if (error) return setErro('Não foi possível alterar a senha: ' + error.message);
    await supabase.auth.signOut();
    try { localStorage.removeItem('mkorp_sessao'); } catch { /* noop */ }
    setOk(true);
  };

  const campo = 'w-full px-4 py-3 rounded-xl text-sm text-[#F5F5F0] bg-[#121419] border border-[#30353F] focus:outline-none focus:border-[#F08020]';

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#0A0A0A]">
      <div className="w-full max-w-sm rounded-3xl p-8 bg-[#12141A] border border-white/10 space-y-4">
        <h1 className="text-xl font-semibold text-[#F5F5F0]">Criar nova senha</h1>
        {ok ? (
          <>
            <p role="status" className="text-sm text-[#34D399]">Senha alterada. Entre no app com a nova senha.</p>
            <Link to="/login" className="block text-center w-full py-3 bg-[#F08020] text-[#0A0B0D] rounded-xl text-sm font-semibold">Ir para o login</Link>
          </>
        ) : !pronto ? (
          <p className="text-sm text-[#A8ADB8]">
            {invalido ? 'Link inválido ou expirado. Peça um novo em "Esqueci minha senha".' : 'Validando o link...'}
          </p>
        ) : (
          <form onSubmit={salvar} className="space-y-4">
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Nova senha (mín. 8)" autoComplete="new-password" aria-label="Nova senha" className={campo} />
            <input type="password" value={senha2} onChange={e => setSenha2(e.target.value)} placeholder="Repita a nova senha" autoComplete="new-password" aria-label="Repita a nova senha" className={campo} />
            {erro && <p role="alert" className="text-sm text-[#F87171]">{erro}</p>}
            <button type="submit" disabled={salvando} className="w-full py-3 bg-[#F08020] text-[#0A0B0D] rounded-xl text-sm font-semibold disabled:opacity-60">
              {salvando ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
