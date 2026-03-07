const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/login/backend/api';

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
});

async function apiCall(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error en la solicitud');
    }

    return data;
}

export const notificacoesService = {
  /**
   * Listar todas as notificações
   * @param {Object} params - Parâmetros de filtro
   * @param {number} params.limit - Limite de resultados (padrão: 50)
   * @param {number} params.offset - Offset para paginação (padrão: 0)
   * @param {boolean} params.nao_lidas - Filtrar apenas não lidas
   * @returns {Promise<{notificacoes: Array, total_nao_lidas: number}>}
   */
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    if (params.nao_lidas) queryParams.append('nao_lidas', 'true');

    const response = await apiCall(`/notificacoes/list.php?${queryParams.toString()}`);
    return response;
  },

  /**
   * Marcar notificação(ões) como lida(s)
   * @param {number|Array<number>|'all'} ids - ID único, array de IDs ou 'all' para marcar todas
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async markAsRead(ids) {
    if (ids === 'all') {
      return await apiCall('/notificacoes/mark-read.php', {
        method: 'POST',
        body: JSON.stringify({ all: true })
      });
    } else if (Array.isArray(ids)) {
      return await apiCall('/notificacoes/mark-read.php', {
        method: 'POST',
        body: JSON.stringify({ ids })
      });
    } else {
      return await apiCall('/notificacoes/mark-read.php', {
        method: 'POST',
        body: JSON.stringify({ id: ids })
      });
    }
  },

  /**
   * Contar notificações não lidas
   * @returns {Promise<{total: number}>}
   */
  async countUnread() {
    const response = await apiCall('/notificacoes/count-unread.php');
    return response;
  }
};
