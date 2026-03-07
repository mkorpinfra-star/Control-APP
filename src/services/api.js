// Build: 2026-02-02T15:59
const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/login/backend/api';

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
});

// Generic API call function
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

// ==================== AUTH ====================
export const authService = {
    login: (passport, password) =>
        apiCall('/auth/login.php', {
            method: 'POST',
            body: JSON.stringify({ passport, password }),
        }),
};

// ==================== USUARIOS ====================
export const usuariosService = {
    getAll: (tipo = null) =>
        apiCall(`/usuarios/list.php${tipo ? `?tipo=${tipo}` : ''}`),

    getById: (id) =>
        apiCall(`/usuarios/get.php?id=${id}`),

    create: (data) =>
        apiCall('/usuarios/create.php', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id, data) =>
        apiCall('/usuarios/update.php', {
            method: 'PUT',
            body: JSON.stringify({ id, ...data }),
        }),

    delete: (id) =>
        apiCall('/usuarios/delete.php', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        }),
};

// ==================== CLIENTES ====================
export const clientesService = {
    getAll: () =>
        apiCall('/clientes/list.php'),

    getById: (id) =>
        apiCall(`/clientes/get.php?id=${id}`),

    create: (data) =>
        apiCall('/clientes/create.php', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id, data) =>
        apiCall('/clientes/update.php', {
            method: 'PUT',
            body: JSON.stringify({ id, ...data }),
        }),

    delete: (id) =>
        apiCall('/clientes/delete.php', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        }),
};

// ==================== OBRAS ====================
export const obrasService = {
    getAll: async () => {
        const response = await apiCall('/obras/list.php');
        return response.obras || response; // Suporta ambos formatos: {success, obras} ou array direto
    },

    getById: (id) =>
        apiCall(`/obras/get.php?id=${id}`),

    getByEmployee: (funcionarioId) =>
        apiCall(`/obras/by-employee.php?funcionario_id=${funcionarioId}`),

    create: (data) =>
        apiCall('/obras/create.php', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id, data) =>
        apiCall('/obras/update.php', {
            method: 'PUT',
            body: JSON.stringify({ id, ...data }),
        }),

    delete: (id, force = false) =>
        apiCall('/obras/delete.php', {
            method: 'DELETE',
            body: JSON.stringify({ id, force }),
        }),

    assignEmployee: (obraId, funcionarioId) =>
        apiCall('/obras/assign-employee.php', {
            method: 'POST',
            body: JSON.stringify({ obra_id: obraId, funcionario_id: funcionarioId }),
        }),

    removeEmployee: (obraId, funcionarioId) =>
        apiCall('/obras/remove-employee.php', {
            method: 'DELETE',
            body: JSON.stringify({ obra_id: obraId, funcionario_id: funcionarioId }),
        }),
};

// ==================== APONTAMENTOS ====================
export const apontamentosService = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return apiCall(`/apontamentos/list.php${params ? `?${params}` : ''}`);
    },

    getById: (id) =>
        apiCall(`/apontamentos/get.php?id=${id}`),

    getMyWeek: (semanaInicio, obraId = null) =>
        apiCall(`/apontamentos/my-week.php?semana_inicio=${semanaInicio}${obraId ? `&obra_id=${obraId}` : ''}`),

    getPendingApprovals: () =>
        apiCall('/apontamentos/pending.php'),

    save: (data) =>
        apiCall('/apontamentos/save.php', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    submit: (id) =>
        apiCall('/apontamentos/submit.php', {
            method: 'PUT',
            body: JSON.stringify({ id }),
        }),

    approve: (id, assinatura, email_copia = null) =>
        apiCall('/apontamentos/approve.php', {
            method: 'PUT',
            body: JSON.stringify({ id, assinatura, email_copia }),
        }),

    reject: (id, observacao) =>
        apiCall('/apontamentos/reject.php', {
            method: 'PUT',
            body: JSON.stringify({ id, observacao }),
        }),
};

// ==================== CONFIGURAÇÕES ====================
export const configService = {
    get: () =>
        apiCall('/config/get.php'),

    save: (data) =>
        apiCall('/config/save.php', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// ==================== API UNIFICADA ====================
// Objeto simplificado para uso nas páginas de gestão
export const api = {
    // Employees (todos os tipos de usuário)
    getEmployees: () => usuariosService.getAll(),
    createEmployee: (data) => usuariosService.create(data),
    updateEmployee: (id, data) => usuariosService.update(id, data),
    deleteEmployee: (id) => usuariosService.delete(id),

    // Projects
    getProjects: () => obrasService.getAll(),
    createProject: (data) => obrasService.create(data),
    updateProject: (id, data) => obrasService.update(id, data),
    deleteProject: (id, force = false) => obrasService.delete(id, force),
    getProjectEmployees: (obraId) => apiCall(`/obras/employees.php?obra_id=${obraId}`),
    assignEmployees: (obraId, employeeIds) => apiCall('/obras/assign-employees.php', {
        method: 'POST',
        body: JSON.stringify({ obra_id: obraId, funcionario_ids: employeeIds }),
    }),

    // Clients
    getClients: () => clientesService.getAll(),

    // Apontamentos
    getMyWeek: (semana, obraId) => apontamentosService.getMyWeek(semana, obraId),
    saveApontamento: (data) => apontamentosService.save(data),
    submitApontamento: (id) => apontamentosService.submit(id),
    getPendingApprovals: () => apontamentosService.getPendingApprovals(),
    approveApontamento: (id, assinatura, emailCopia) => apontamentosService.approve(id, assinatura, emailCopia),
    rejectApontamento: (id, observacao) => apontamentosService.reject(id, observacao),
};
