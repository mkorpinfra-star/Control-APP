import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Public pages
import LandingHome from '../pages/landing/Home';
import Login from '../pages/Login';
import ApprovePublic from '../pages/ApprovePublic';

// User pages
import BaterPonto from '../pages/BaterPonto';
import Approvals from '../pages/Approvals';

// Admin pages
import DashboardBanking from '../pages/DashboardBanking';
import Timesheet from '../pages/Timesheet';
import Projects from '../pages/Projects';
import Clients from '../pages/Clients';
import Employees from '../pages/Employees';
import Encarregados from '../pages/Encarregados';
import Administradores from '../pages/Administradores';
import Monitoramento from '../pages/Monitoramento';
import Payroll from '../pages/Payroll';
import Billing from '../pages/Billing';
import Analytics from '../pages/Analytics';
import AnalyticsAdvanced from '../pages/AnalyticsAdvanced';
import FinancialDashboard from '../pages/FinancialDashboard';
import ApprovedFinancial from '../pages/ApprovedFinancial';
import Reports from '../pages/Reports';
import ResumoObra from '../pages/ResumoObra';
import Settings from '../pages/Settings';

// Layout
import BankingLayout from '../components/BankingLayout';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Home Router - redirects based on user type
function HomeRouter() {
  const { user } = useAuth();

  const isAdmin = user?.tipo === 'admin' || user?.tipo === 'super_admin';
  const isEncarregado = user?.tipo === 'encarregado';

  if (isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isEncarregado) {
    return <Navigate to="/approvals" replace />;
  }

  return <Navigate to="/bater-ponto" replace />;
}

export default function TenantRoutes() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/" element={isAuthenticated ? <HomeRouter /> : <LandingHome />} />
      <Route path="/login" element={isAuthenticated ? <HomeRouter /> : <Login />} />
      <Route path="/approve/:token" element={<ApprovePublic />} />

      {/* Rotas protegidas com layout - FLAT STRUCTURE (sem /admin/*) */}
      <Route element={
        <ProtectedRoute>
          <BankingLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<DashboardBanking />} />
        <Route path="/timesheet" element={<Timesheet />} />
        <Route path="/bater-ponto" element={<BaterPonto />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/encarregados" element={<Encarregados />} />
        <Route path="/administradores" element={<Administradores />} />
        <Route path="/monitoramento" element={<Monitoramento />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/analytics-advanced" element={<AnalyticsAdvanced />} />
        <Route path="/financial" element={<FinancialDashboard />} />
        <Route path="/approved-financial" element={<ApprovedFinancial />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/resumo-obra" element={<ResumoObra />} />
      </Route>

      {/* Catch all - mantém dentro do app */}
      <Route path="*" element={isAuthenticated ? <HomeRouter /> : <Navigate to="/" replace />} />
    </Routes>
  );
}
