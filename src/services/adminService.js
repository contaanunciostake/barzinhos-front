import { apiRequest } from '../lib/api.js';

// Serviços de Administração
export const adminService = {
  // Obter todos os estabelecimentos (admin)
  getAllEstablishments: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/admin/establishments${queryString ? `?${queryString}` : ''}`;
    
    return await apiRequest(endpoint);
  },

  // Obter estabelecimento por ID (admin)
  getEstablishmentById: async (id) => {
    return await apiRequest(`/api/admin/establishments/${id}`);
  },

  // Aprovar estabelecimento
  approveEstablishment: async (id) => {
    return await apiRequest(`/api/admin/establishments/${id}/approve`, {
      method: 'PUT',
    });
  },

  // Rejeitar estabelecimento
  rejectEstablishment: async (id, reason) => {
    return await apiRequest(`/api/admin/establishments/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },

  // Atualizar estabelecimento (admin)
  updateEstablishment: async (id, establishmentData) => {
    return await apiRequest(`/api/admin/establishments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(establishmentData),
    });
  },

  // Desativar estabelecimento
  deleteEstablishment: async (id) => {
    return await apiRequest(`/api/admin/establishments/${id}`, {
      method: 'DELETE',
    });
  },

  // Obter estatísticas do dashboard
  getDashboardStats: async () => {
    return await apiRequest('/api/admin/dashboard-stats');
  },

  // Obter estabelecimentos pendentes
  getPendingEstablishments: async () => {
    return await apiRequest('/api/admin/establishments?status=pending');
  },

  // Obter estabelecimentos aprovados
  getApprovedEstablishments: async () => {
    return await apiRequest('/api/admin/establishments?status=approved');
  },

  // Obter estabelecimentos rejeitados
  getRejectedEstablishments: async () => {
    return await apiRequest('/api/admin/establishments?status=rejected');
  },

  // Buscar estabelecimentos
  searchEstablishments: async (query) => {
    return await apiRequest(`/api/admin/establishments?search=${encodeURIComponent(query)}`);
  },

  // Obter relatório de estabelecimentos por bairro
  getEstablishmentsByNeighborhood: async () => {
    const stats = await adminService.getDashboardStats();
    return stats.establishmentsByNeighborhood || [];
  },

  // Obter relatório de estabelecimentos por tipo
  getEstablishmentsByType: async () => {
    const stats = await adminService.getDashboardStats();
    return stats.establishmentsByType || [];
  },
};

