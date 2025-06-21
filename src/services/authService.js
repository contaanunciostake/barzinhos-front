import { apiRequest } from '../lib/api.js';

// Serviços de Autenticação
export const authService = {
  // Login
  login: async (email, password) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Registro de estabelecimento
  registerEstablishment: async (establishmentData) => {
    return await apiRequest('/api/auth/register-establishment', {
      method: 'POST',
      body: JSON.stringify(establishmentData),
    });
  },

  // Registro de administrador
  registerAdmin: async (adminData) => {
    return await apiRequest('/api/auth/register-admin', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  },

  // Obter dados do usuário logado
  getMe: async () => {
    return await apiRequest('/api/auth/me');
  },

  // Atualizar senha
  updatePassword: async (currentPassword, newPassword) => {
    return await apiRequest('/api/auth/update-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verificar se está logado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obter usuário do localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar se é admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'admin';
  },

  // Verificar se é estabelecimento
  isEstablishment: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'establishment';
  },
};

