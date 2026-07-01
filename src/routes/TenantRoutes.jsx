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
import Medicao from '../pages/Medicao';
import Auditoria from '../pages/Auditoria';
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

// Guarda por módulo configurável (admin sempre passa)
function GuardModulo({ modulo, children }) {
  const { podeAcessar } = useAuth();
  return podeAcessar(modulo) ? children : <HomeRouter />;
}

// Regras fixas (não configuráveis)
const REGRAS = {
  adminOnly: (a) => a.isAdmin, // dashboard, funcionários, medição/valores
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
        {/* Fixos do admin */}
        <Route path="/dashboard" element={<Guard allow={REGRAS.adminOnly}><Dashboard /></Guard>} />
        <Route path="/funcionarios" element={<Guard allow={REGRAS.adminOnly}><Funcionarios /></Guard>} />
        <Route path="/medicao" element={<Guard allow={REGRAS.adminOnly}><Medicao /></Guard>} />
        <Route path="/auditoria" element={<Guard allow={REGRAS.adminOnly}><Auditoria /></Guard>} />

        {/* Configuráveis pelo admin (por módulo) */}
        <Route path="/ordens-servico" element={<GuardModulo modulo="ordens"><OrdensServico /></GuardModulo>} />
        <Route path="/contratos" element={<GuardModulo modulo="contratos"><Contratos /></GuardModulo>} />
        <Route path="/controle-ponto" element={<GuardModulo modulo="ponto_gestao"><ControlePonto /></GuardModulo>} />
        <Route path="/monitoramento" element={<GuardModulo modulo="monitoramento"><Monitoramento /></GuardModulo>} />
        <Route path="/relatorios" element={<GuardModulo modulo="relatorios"><Relatorios /></GuardModulo>} />
        <Route path="/aprovacoes" element={<GuardModulo modulo="aprovacoes"><Aprovacoes /></GuardModulo>} />
        <Route path="/almoxarifado" element={<GuardModulo modulo="almoxarifado"><Almoxarifado /></GuardModulo>} />
        <Route path="/almoxarifado/entrada-nf" element={<GuardModulo modulo="almoxarifado"><EntradaNF /></GuardModulo>} />

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
