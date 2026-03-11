import { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    detectTenant();
  }, []);

  const detectTenant = async () => {
    try {
      setLoading(true);

      // 1. Detectar tenant por subdomínio
      const hostname = window.location.hostname;
      const parts = hostname.split('.');

      let tenantSlug = null;

      // Desenvolvimento local
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Pode forçar tenant via localStorage para testes
        tenantSlug = localStorage.getItem('dev_tenant') || 'j2s';
      }
      // Produção: puntoclicks.com
      else if (parts.length === 2) {
        // puntoclicks.com → landing page (sem tenant)
        tenantSlug = null;
      }
      // Produção: j2s.puntoclicks.com
      else if (parts.length >= 3) {
        tenantSlug = parts[0]; // j2s, cliente2, etc
      }

      // Se não tem tenant, é landing page
      if (!tenantSlug) {
        setTenant(null);
        setLoading(false);
        return;
      }

      // 2. Buscar dados do tenant no backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tenants/get.php?slug=${tenantSlug}`
      );

      if (!response.ok) {
        throw new Error('Tenant não encontrado');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Erro ao carregar tenant');
      }

      // Verificar se tenant está ativo
      if (data.tenant.status !== 'ativo' && data.tenant.status !== 'trial') {
        throw new Error('Conta suspensa ou inativa');
      }

      // 3. Aplicar branding do tenant
      applyTenantBranding(data.tenant);

      // 4. Salvar tenant no contexto
      setTenant(data.tenant);

    } catch (err) {
      console.error('❌ Erro ao detectar tenant:', err);
      setError(err.message);

      // Redirecionar para página de erro ou landing
      if (window.location.pathname !== '/tenant-error') {
        window.location.href = '/tenant-error';
      }
    } finally {
      setLoading(false);
    }
  };

  const applyTenantBranding = (tenantData) => {
    // Aplicar cores primárias
    if (tenantData.primary_color) {
      document.documentElement.style.setProperty('--tenant-primary', tenantData.primary_color);
    }

    if (tenantData.secondary_color) {
      document.documentElement.style.setProperty('--tenant-secondary', tenantData.secondary_color);
    }

    // Aplicar favicon
    if (tenantData.favicon_url) {
      const favicon = document.querySelector("link[rel~='icon']");
      if (favicon) {
        favicon.href = tenantData.favicon_url;
      }
    }

    // Aplicar título da página
    document.title = `${tenantData.nome} - PuntoTouch`;

    // Salvar no localStorage para uso offline
    localStorage.setItem('tenant_cache', JSON.stringify({
      ...tenantData,
      cached_at: new Date().toISOString()
    }));
  };

  const switchTenant = (newSlug) => {
    // Redirecionar para novo subdomínio
    const newUrl = `${window.location.protocol}//${newSlug}.${window.location.hostname.split('.').slice(-2).join('.')}`;
    window.location.href = newUrl;
  };

  const refreshTenant = () => {
    detectTenant();
  };

  const value = {
    tenant,
    loading,
    error,
    switchTenant,
    refreshTenant,
    isTenantActive: tenant?.status === 'ativo' || tenant?.status === 'trial',
    tenantId: tenant?.id,
    tenantSlug: tenant?.slug,
    tenantName: tenant?.nome,
    tenantLogo: tenant?.logo_url,
    primaryColor: tenant?.primary_color || '#CE0201',
    secondaryColor: tenant?.secondary_color || '#A00101',
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}

// Hook para verificar se está em modo multi-tenant
export function useIsMultiTenant() {
  const { tenant } = useTenant();
  return tenant !== null;
}

// Hook para garantir que está em contexto de tenant
export function useRequireTenant() {
  const { tenant, loading } = useTenant();

  useEffect(() => {
    if (!loading && !tenant) {
      // Redirecionar para landing se não tem tenant
      window.location.href = '/';
    }
  }, [tenant, loading]);

  return { tenant, loading };
}
