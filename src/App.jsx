import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import QueryProvider from './providers/QueryProvider';
import './i18n';
import './index.css';

// Routes
import AdminRoutes from './routes/AdminRoutes';
import TenantRoutes from './routes/TenantRoutes';

// Components
import AnimatedSplash from './components/AnimatedSplash';

// Domain Detection Hook
function useDomainDetection() {
  const hostname = window.location.hostname;

  console.log('🌐 Hostname:', hostname);

  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('✅ Modo: APP (localhost)');
    return { type: 'app' };
  }

  // Super Admin (admin.puntotouch.nextim.io)
  if (hostname === 'admin.puntotouch.nextim.io') {
    console.log('✅ Modo: SUPER ADMIN');
    return { type: 'admin' };
  }

  // App Principal (puntotouch.nextim.io) - TODOS os usuários entram aqui
  if (hostname === 'puntotouch.nextim.io' || hostname === 'www.puntotouch.nextim.io') {
    console.log('✅ Modo: APP PRINCIPAL');
    return { type: 'app' };
  }

  // Default to app
  console.log('⚠️ Modo: APP (default)');
  return { type: 'app' };
}

// Main App Routes
function AppRoutes() {
  const domain = useDomainDetection();

  // Super Admin Panel (admin.puntoclicks.com)
  if (domain.type === 'admin') {
    return <AdminRoutes />;
  }

  // App Principal (puntoclicks.com) - Login único para todos
  return <TenantRoutes />;
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
    <QueryProvider>
      <BrowserRouter>
        <TenantProvider>
          <AuthProvider>
            {showSplash ? (
              <AnimatedSplash onComplete={() => setShowSplash(false)} />
            ) : (
              <AppRoutes />
            )}
          </AuthProvider>
        </TenantProvider>
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;
