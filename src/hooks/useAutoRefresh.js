import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook para auto-refresh inteligente de dados
 *
 * Features:
 * - Refetch automático quando usuário volta ao app (window focus)
 * - Refetch quando reconecta à internet
 * - Polling opcional em segundo plano (com intervalo configurável)
 * - Economiza bateria: para polling quando app está em background
 *
 * @param {string[]} queryKeys - Array de chaves de queries para invalidar
 * @param {Object} options - Opções de configuração
 * @param {number} options.pollingInterval - Intervalo de polling em ms (0 = desabilitado)
 * @param {boolean} options.refetchOnFocus - Refetch ao voltar foco (default: true)
 * @param {boolean} options.refetchOnReconnect - Refetch ao reconectar (default: true)
 */
export function useAutoRefresh(queryKeys = [], options = {}) {
  const queryClient = useQueryClient();
  const intervalRef = useRef(null);

  const {
    pollingInterval = 0, // Desabilitado por padrão (economiza bateria)
    refetchOnFocus = true,
    refetchOnReconnect = true,
  } = options;

  // Função para invalidar queries e forçar refetch
  const invalidateQueries = () => {
    if (queryKeys.length > 0) {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
      });
    }
  };

  // Refetch quando janela volta ao foco (usuário volta ao app)
  useEffect(() => {
    if (!refetchOnFocus) return;

    const handleFocus = () => {
      console.log('🔄 App voltou ao foco - refetching data...');
      invalidateQueries();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [queryKeys.length, refetchOnFocus]);

  // Refetch quando reconecta à internet
  useEffect(() => {
    if (!refetchOnReconnect) return;

    const handleOnline = () => {
      console.log('🌐 Conexão restaurada - refetching data...');
      invalidateQueries();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [queryKeys.length, refetchOnReconnect]);

  // Polling em background (opcional - apenas quando especificado)
  useEffect(() => {
    if (!pollingInterval || pollingInterval <= 0) return;

    // Só faz polling se janela estiver visível (economiza bateria)
    const startPolling = () => {
      if (intervalRef.current) return; // Já está rodando

      intervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          console.log(`🔄 Polling (${pollingInterval}ms) - refetching data...`);
          invalidateQueries();
        }
      }, pollingInterval);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Para polling quando tab fica escondida (economiza bateria)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab visível - iniciando polling...');
        startPolling();
      } else {
        console.log('👁️ Tab escondida - parando polling...');
        stopPolling();
      }
    };

    // Inicia polling se tab está visível
    if (document.visibilityState === 'visible') {
      startPolling();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pollingInterval, queryKeys.length]);

  return { invalidateQueries };
}
