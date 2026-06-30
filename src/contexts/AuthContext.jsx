import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [perfil, setPerfil]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão do localStorage ao recarregar
  useEffect(() => {
    try {
      const salvo = localStorage.getItem('mkorp_sessao');
      if (salvo) setPerfil(JSON.parse(salvo));
    } finally {
      setLoading(false);
    }
  }, []);

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
  const isAdmin       = cargo === 'admin';

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
      isAdmin,
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
