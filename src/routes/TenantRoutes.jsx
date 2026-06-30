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
  const { isAdmin, isSupervisor } = useAuth();
  if (isAdmin) return <Navigate to="/dashboard" replace />;
  if (isSupervisor) return <Navigate to="/aprovacoes" replace />;
  return <Navigate to="/bater-ponto" replace />;
}

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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ordens-servico" element={<OrdensServico />} />
        <Route path="/contratos" element={<Contratos />} />
        <Route path="/funcionarios" element={<Funcionarios />} />
        <Route path="/almoxarifado" element={<Almoxarifado />} />
        <Route path="/almoxarifado/entrada-nf" element={<EntradaNF />} />
        <Route path="/requisicoes" element={<Requisicoes />} />
        <Route path="/controle-ponto" element={<ControlePonto />} />
        <Route path="/monitoramento" element={<Monitoramento />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/configuracoes" element={<Configuracoes />} />

        {/* Funcionário de campo */}
        <Route path="/bater-ponto" element={<BaterPonto />} />
        <Route path="/registro-campo" element={<RegistroCampo />} />

        {/* Supervisor */}
        <Route path="/aprovacoes" element={<Aprovacoes />} />
      </Route>

      <Route path="*" element={isAuthenticated ? <HomeRouter /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}
