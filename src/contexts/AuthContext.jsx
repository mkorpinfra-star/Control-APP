import { createContext, useContext, useState, useEffect } from 'react';
import { authService, configService, supabase } from '../services/supabase';
import { podeAcessarModulo } from '../lib/acessos';

const AuthContext = createContext(null);
const CHAVE = 'mkorp_sessao';

function lerCache() {
  try { return JSON.parse(localStorage.getItem(CHAVE) || 'null'); } catch { return null; }
}
function limparCache() {
  try { localStorage.removeItem(CHAVE); } catch { /* noop */ }
}

export function AuthProvider({ children }) {
  const [perfil, setPerfil]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [acessos, setAcessos] = useState(null); // matriz configurada pelo admin
  const [avisoSessao, setAvisoSessao] = useState('');

  // Restaura a sessão validando o token real do Supabase (antes confiava só no localStorage:
  // com o token expirado/revogado o app "parecia logado" e as telas vinham vazias).
  useEffect(() => {
    let ativo = true;
    (async () => {
      const cache = lerCache();
      try {
        const { data, error } = await authService.getSession();
        if (!ativo) return;
        const sessao = data?.session;
        if (sessao?.perfil) {
          if (sessao.perfil.ativo === false) {
            await authService.logout();
            limparCache(); setPerfil(null);
            setAvisoSessao('Seu acesso foi desativado. Procure o administrador.');
          } else {
            setPerfil(sessao.perfil);
            localStorage.setItem(CHAVE, JSON.stringify(sessao.perfil));
          }
        } else if (error && cache) {
          // falha de rede: mantém o perfil em cache; as telas mostram erro de conexão
          setPerfil(cache);
        } else {
          limparCache(); setPerfil(null);
          if (cache) setAvisoSessao('Sua sessão expirou. Entre novamente.');
        }
      } catch {
        if (ativo && cache) setPerfil(cache);
      } finally {
        if (ativo) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === 'SIGNED_OUT') { limparCache(); setPerfil(null); }
    });
    return () => { ativo = false; sub?.subscription?.unsubscribe(); };
  }, []);

  // Carrega a matriz de acessos configurada
  useEffect(() => {
    if (!perfil) return;
    configService.get().then(cfg => setAcessos(cfg?.acessos || null)).catch(() => setAcessos(null));
  }, [perfil]);

  const login = async (email, senha) => {
    try {
      const sessao = await authService.login(email, senha);
      setPerfil(sessao.perfil);
      setAvisoSessao('');
      localStorage.setItem(CHAVE, JSON.stringify(sessao.perfil));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    authService.logout();
    setPerfil(null);
    limparCache();
  };

  const atualizarPerfil = (atualizacoes) => {
    const novo = { ...perfil, ...atualizacoes };
    setPerfil(novo);
    localStorage.setItem(CHAVE, JSON.stringify(novo));
  };

  // Helpers de cargo
  const cargo = perfil?.cargo;
  const isFuncionario = cargo === 'eletricista' || cargo === 'ajudante' || cargo === 'motorista';
  const isSupervisor  = cargo === 'supervisor';
  const isAlmoxarife  = cargo === 'almoxarife';
  const isAdmin       = cargo === 'admin';

  // Matriz de permissões (amarrações de fluxo)
  const canAprovarRequisicao = isAdmin || isSupervisor || isAlmoxarife;
  const canGerenciarEstoque  = isAdmin || isAlmoxarife;
  const canAprovarPonto      = isAdmin || isSupervisor;
  const canFecharPonto       = isAdmin; // admin/RH
  const canGerenciarOS       = isAdmin || isSupervisor;
  const canGerenciarUsuarios = isAdmin;
  const podeVerValores       = isAdmin; // valores R$ só admin

  // Acesso configurável por módulo (admin sempre pode; override por usuário tem prioridade)
  const podeAcessar = (modulo) => podeAcessarModulo(cargo, modulo, acessos, perfil?.acessos);

  return (
    <AuthContext.Provider value={{
      perfil,
      loading,
      avisoSessao,
      login,
      logout,
      atualizarPerfil,
      isAuthenticated: !!perfil,
      isFuncionario,
      isSupervisor,
      isAlmoxarife,
      isAdmin,
      canAprovarRequisicao,
      canGerenciarEstoque,
      canAprovarPonto,
      canFecharPonto,
      canGerenciarOS,
      canGerenciarUsuarios,
      podeVerValores,
      podeAcessar,
      cargo,
      nome: perfil?.nome,
      // Aliases para compatibilidade com componentes antigos
      user: perfil,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
