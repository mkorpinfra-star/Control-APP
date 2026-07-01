import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Auth
import Login from '../pages/Login';

// Funcionário de campo
import BaterPonto from '../pages/BaterPonto';
import RegistroCampo from '../pages/RegistroCampo';

// Supervisor + Admin
import Aprovacoes from '../pages/Approvals';
import Monitoramento from '../pages/Monitoramento';

// Admin
import Dashboard from '../pages/DashboardBanking';
import OrdensServico from '../pages/OrdensServico';
import Contratos from '../pages/Contratos';
import Funcionarios from '../pages/Employees';
import Almoxarifado from '../pages/Almoxarifado';
import EntradaNF from '../pages/EntradaNF';
import Requisicoes from '../pages/Requisicoes';
import ControlePonto from '../pages/Timesheet';
import Relatorios from '../pages/Reports';
import Configuracoes from '../pages/Settings';

// Layout
import BankingLayout from '../components/BankingLayout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function HomeRouter() {
  const { isAdmin, isSupervisor, isAlmoxarife } = useAuth();
  if (isAdmin) return <Navigate to="/dashboard" replace />;
  if (isSupervisor) return <Navigate to="/aprovacoes" replace />;
  if (isAlmoxarife) return <Navigate to="/almoxarifado" replace />;
  return <Navigate to="/bater-ponto" replace />;
}

// Guarda de acesso por papel: se não permitido, volta para a home do usuário
function Guard({ allow, children }) {
  const auth = useAuth();
  return allow(auth) ? children : <HomeRouter />;
}

// Regras de acesso
const REGRAS = {
  gestao:    (a) => a.isAdmin || a.isSupervisor,               // OS, contratos, monitoramento, relatórios, aprovações, ponto
  adminOnly: (a) => a.isAdmin,                                  // dashboard, funcionários
  estoque:   (a) => a.isAdmin || a.isSupervisor || a.isAlmoxarife, // almoxarifado
  todos:     () => true,                                        // requisições, config, ponto próprio, campo
};

export default function TenantRoutes() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <HomeRouter /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={isAuthenticated ? <HomeRouter /> : <Login />} />

      <Route element={
        <ProtectedRoute>
          <BankingLayout />
        </ProtectedRoute>
      }>
        {/* Admin */}
        <Route path="/dashboard" element={<Guard allow={REGRAS.adminOnly}><Dashboard /></Guard>} />
        <Route path="/funcionarios" element={<Guard allow={REGRAS.adminOnly}><Funcionarios /></Guard>} />

        {/* Gestão (admin + supervisor) */}
        <Route path="/ordens-servico" element={<Guard allow={REGRAS.gestao}><OrdensServico /></Guard>} />
        <Route path="/contratos" element={<Guard allow={REGRAS.gestao}><Contratos /></Guard>} />
        <Route path="/controle-ponto" element={<Guard allow={REGRAS.gestao}><ControlePonto /></Guard>} />
        <Route path="/monitoramento" element={<Guard allow={REGRAS.gestao}><Monitoramento /></Guard>} />
        <Route path="/relatorios" element={<Guard allow={REGRAS.gestao}><Relatorios /></Guard>} />
        <Route path="/aprovacoes" element={<Guard allow={REGRAS.gestao}><Aprovacoes /></Guard>} />

        {/* Estoque (admin + supervisor + almoxarife) */}
        <Route path="/almoxarifado" element={<Guard allow={REGRAS.estoque}><Almoxarifado /></Guard>} />
        <Route path="/almoxarifado/entrada-nf" element={<Guard allow={REGRAS.estoque}><EntradaNF /></Guard>} />

        {/* Todos os autenticados */}
        <Route path="/requisicoes" element={<Requisicoes />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/bater-ponto" element={<BaterPonto />} />
        <Route path="/registro-campo" element={<RegistroCampo />} />
      </Route>

      <Route path="*" element={isAuthenticated ? <HomeRouter /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}
