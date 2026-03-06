import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import './i18n';
import './index.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Timesheet from './pages/Timesheet';
import BaterPonto from './pages/BaterPonto';
import Approvals from './pages/Approvals';
import Employees from './pages/Employees';
import Projects from './pages/Projects';
import Clients from './pages/Clients';
import Payroll from './pages/Payroll';
import Billing from './pages/Billing';
import Analytics from './pages/Analytics';
import AnalyticsAdvanced from './pages/AnalyticsAdvanced';
import FinancialDashboard from './pages/FinancialDashboard';
import ApprovedFinancial from './pages/ApprovedFinancial';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import ResumoObra from './pages/ResumoObra';

// Components
import Layout from './components/Layout';
import BankingLayout from './components/BankingLayout';
import AnimatedSplash from './components/AnimatedSplash';
import DashboardBanking from './pages/DashboardBanking';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Home Router - redirects based on user type
function HomeRouter() {
  const { user, isAdmin, isSupervisor } = useAuth();

  console.log('HomeRouter - user:', user);
  console.log('HomeRouter - isAdmin:', isAdmin, 'isSupervisor:', isSupervisor);

  // Admin vai para Dashboard Banking
  if (isAdmin) {
    return <DashboardBanking />;
  }

  // Supervisor vai para aprovações
  if (isSupervisor) {
    return <Approvals />;
  }

  // Funcionário vai para bater ponto
  return <BaterPonto />;
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login na raiz quando não autenticado */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <ProtectedRoute>
              <BankingLayout />
            </ProtectedRoute>
          ) : (
            <Login />
          )
        }
      >
        {isAuthenticated && (
          <>
            <Route index element={<HomeRouter />} />
            <Route path="dashboard" element={<DashboardBanking />} />
            <Route path="timesheet" element={<Timesheet />} />
            <Route path="bater-ponto" element={<BaterPonto />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="employees" element={<Employees />} />
            <Route path="projects" element={<Projects />} />
            <Route path="clients" element={<Clients />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="billing" element={<Billing />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="analytics-advanced" element={<AnalyticsAdvanced />} />
            <Route path="financial" element={<FinancialDashboard />} />
            <Route path="approved-financial" element={<ApprovedFinancial />} />
            <Route path="settings" element={<Settings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="resumo-obra" element={<ResumoObra />} />
          </>
        )}
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Detectar se é app (não mostrar splash no navegador)
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone === true ||
                        document.referrer.includes('android-app://');

    // Se não for app, pular splash
    if (!isStandalone) {
      setShowSplash(false);
    }
  }, []);

  return (
    <BrowserRouter basename="/login">
      <AuthProvider>
        {showSplash ? (
          <AnimatedSplash onComplete={() => setShowSplash(false)} />
        ) : (
          <AppRoutes />
        )}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
