import axios from 'axios';

// Configuração da API base
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas de erro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};

// Serviços de estabelecimentos
export const establishmentService = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/establishments', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/establishments/${id}`);
    return response.data;
  },

  getMyEstablishment: async () => {
    const response = await api.get('/api/establishments/my');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/establishments/stats');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/api/establishments', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/establishments/${id}`, data);
    return response.data;
  },

  uploadImage: async (id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(`/api/establishments/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteImage: async (establishmentId, imageId) => {
    const response = await api.delete(`/api/establishments/${establishmentId}/images/${imageId}`);
    return response.data;
  },

  getCepInfo: async (cep) => {
    const response = await api.get(`/api/establishments/cep/${cep}`);
    return response.data;
  },
};

// Serviços de avaliações
export const reviewService = {
  create: async (data) => {
    const response = await api.post('/api/reviews', data);
    return response.data;
  },

  getByEstablishment: async (establishmentId, params = {}) => {
    const response = await api.get(`/api/reviews/establishment/${establishmentId}`, { params });
    return response.data;
  },

  getPending: async (params = {}) => {
    const response = await api.get('/api/reviews/pending', { params });
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/reviews/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/reviews/${id}`);
    return response.data;
  },
};

// Serviços de geolocalização
export const geoService = {
  getUserLocation: async () => {
    const response = await api.get('/api/geo/location');
    return response.data;
  },

  getNearbyEstablishments: async (params = {}) => {
    const response = await api.get('/api/geo/establishments/nearby', { params });
    return response.data;
  },
};

// Serviços de usuários (admin)
export const userService = {
  getStats: async () => {
    const response = await api.get('/api/stats');
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/api/auth/users');
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/auth/users/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/auth/users/${id}`);
    return response.data;
  },

  updateProfile: async (id, data) => {
    const response = await api.put(`/api/users/${id}/profile`, data);
    return response.data;
  },

  uploadProfilePhoto: async (id, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await api.post(`/api/users/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;


// Serviços de planos
export const planService = {
  subscribe: async (planId) => {
    const response = await api.post('/api/plans/subscribe', { plan_id: planId });
    return response.data;
  },

  getMySubscription: async () => {
    const response = await api.get('/api/plans/my-subscription');
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await api.delete('/api/plans/my-subscription');
    return response.data;
  },
};

