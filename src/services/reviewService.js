import { apiRequest } from '../lib/api.js';

// Serviços de Avaliações
export const reviewService = {
  // Obter avaliações de um estabelecimento
  getEstablishmentReviews: async (establishmentId, page = 1, limit = 10) => {
    return await apiRequest(`/api/reviews/establishment/${establishmentId}?page=${page}&limit=${limit}`);
  },

  // Criar nova avaliação
  createReview: async (reviewData) => {
    return await apiRequest('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  // Atualizar avaliação
  updateReview: async (reviewId, reviewData) => {
    return await apiRequest(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  },

  // Deletar avaliação
  deleteReview: async (reviewId) => {
    return await apiRequest(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },

  // Obter minhas avaliações
  getMyReviews: async () => {
    return await apiRequest('/api/reviews/my-reviews');
  },

  // Verificar se usuário já avaliou um estabelecimento
  hasUserReviewed: async (establishmentId) => {
    try {
      const response = await apiRequest(`/api/reviews/check/${establishmentId}`);
      return response.hasReviewed;
    } catch (error) {
      return false;
    }
  },

  // Obter estatísticas de avaliações
  getReviewStats: async (establishmentId) => {
    return await apiRequest(`/api/reviews/stats/${establishmentId}`);
  },
};

