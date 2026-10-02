import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Auth
import Login from '../pages/Login';

// Funcionário de campo
const BaterPonto = lazy(() => import('../pages/BaterPonto'));
const RegistroCampo = lazy(() => import('../pages/RegistroCampo'));

// Supervisor + Admin
const Aprovacoes = lazy(() => import('../pages/Approvals'));
const Monitoramento = lazy(() => import('../pages/Monitoramento'));

// Admin
const Dashboard = lazy(() => import('../pages/DashboardBanking'));
const OrdensServico = lazy(() => import('../pages/OrdensServico'));
const Contratos = lazy(() => import('../pages/Contratos'));
const Funcionarios = lazy(() => import('../pages/Employees'));
const Almoxarifado = lazy(() => import('../pages/Almoxarifado'));
const EntradaNF = lazy(() => import('../pages/EntradaNF'));
const Requisicoes = lazy(() => import('../pages/Requisicoes'));
const ControlePonto = lazy(() => import('../pages/Timesheet'));
const Relatorios = lazy(() => import('../pages/Reports'));
const Medicao = lazy(() => import('../pages/Medicao'));
const Auditoria = lazy(() => import('../pages/Auditoria'));
const Configuracoes = lazy(() => import('../pages/Settings'));

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
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0A0B0D]"><div className="loading-spinner" /></div>}>
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
    </Suspense>
  );
}
