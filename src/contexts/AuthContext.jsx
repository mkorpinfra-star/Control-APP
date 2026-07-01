import { createContext, useContext, useState, useEffect } from 'react';
import { authService, configService } from '../services/supabase';
import { podeAcessarModulo } from '../lib/acessos';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [perfil, setPerfil]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [acessos, setAcessos] = useState(null); // matriz configurada pelo admin

  // Restaura sessão do localStorage ao recarregar
  useEffect(() => {
    try {
      const salvo = localStorage.getItem('mkorp_sessao');
      if (salvo) setPerfil(JSON.parse(salvo));
    } finally {
      setLoading(false);
    }
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
      localStorage.setItem('mkorp_sessao', JSON.stringify(sessao.perfil));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    authService.logout();
    setPerfil(null);
    localStorage.removeItem('mkorp_sessao');
  };

  const atualizarPerfil = (atualizacoes) => {
    const novo = { ...perfil, ...atualizacoes };
    setPerfil(novo);
    localStorage.setItem('mkorp_sessao', JSON.stringify(novo));
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
