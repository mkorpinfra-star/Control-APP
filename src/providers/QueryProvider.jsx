import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configuração do QueryClient com refresh automático
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetch quando a janela volta ao foco (usuário volta ao app)
      refetchOnWindowFocus: true,

      // Refetch quando reconecta à internet
      refetchOnReconnect: true,

      // Cache por 5 minutos (dados ainda válidos)
      staleTime: 5 * 60 * 1000,

      // Manter em cache por 10 minutos
      cacheTime: 10 * 60 * 1000,

      // Retry automático em caso de erro (3 tentativas)
      retry: 1,

      // Não refetch automaticamente em background por padrão
      // (economiza bateria)
      refetchInterval: false,
    },
  },
});

export default function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };
