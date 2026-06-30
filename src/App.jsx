import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import QueryProvider from './providers/QueryProvider';
import './index.css';

import TenantRoutes from './routes/TenantRoutes';
import AnimatedSplash from './components/AnimatedSplash';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (!isStandalone) setShowSplash(false);
  }, []);

  return (
    <QueryProvider>
      <BrowserRouter>
        <AuthProvider>
          {showSplash ? (
            <AnimatedSplash onComplete={() => setShowSplash(false)} />
          ) : (
            <TenantRoutes />
          )}
        </AuthProvider>
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;
