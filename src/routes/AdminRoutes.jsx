import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/AdminLayout';

// Admin pages (Super Admin - admin.puntoclicks.com)
import AdminLogin from '../pages/admin/Login';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminTenants from '../pages/admin/Tenants';
import AdminCreateTenant from '../pages/admin/CreateTenant';
import AdminAnalytics from '../pages/admin/Analytics';

// Protected Route for Super Admin
function SuperAdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user?.tipo !== 'super_admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AdminRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Login público para super admin */}
      <Route path="/login" element={<AdminLogin />} />

      {/* Rotas protegidas do Super Admin */}
      <Route element={
        <SuperAdminRoute>
          <AdminLayout />
        </SuperAdminRoute>
      }>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/tenants" element={<AdminTenants />} />
        <Route path="/tenants/create" element={<AdminCreateTenant />} />
        <Route path="/analytics" element={<AdminAnalytics />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
