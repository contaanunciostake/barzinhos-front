import { apiRequest, uploadFiles } from '../lib/api.js';

// Serviços de Estabelecimentos
export const establishmentService = {
  // Obter todos os estabelecimentos (público)
  getEstablishments: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/establishments${queryString ? `?${queryString}` : ''}`;
    
    return await apiRequest(endpoint);
  },

  // Obter estabelecimento por ID (público)
  getEstablishmentById: async (id) => {
    return await apiRequest(`/api/establishments/${id}`);
  },

  // Criar novo estabelecimento (público)
  createEstablishment: async (establishmentData) => {
    return await apiRequest('/api/establishments', {
      method: 'POST',
      body: JSON.stringify(establishmentData),
    });
  },

  // Obter meu estabelecimento (autenticado)
  getMyEstablishment: async () => {
    return await apiRequest('/api/establishments/my-establishment');
  },

  // Atualizar meu estabelecimento (autenticado)
  updateMyEstablishment: async (establishmentData) => {
    return await apiRequest('/api/establishments/my-establishment', {
      method: 'PUT',
      body: JSON.stringify(establishmentData),
    });
  },

  // Upload de imagens
  uploadImages: async (files, isLogo = false) => {
    const endpoint = '/api/establishments/upload-images';
    return await uploadFiles(endpoint, files, { isLogo: isLogo.toString() });
  },

  // Remover imagem
  removeImage: async (imageUrl, isLogo = false) => {
    return await apiRequest('/api/establishments/remove-image', {
      method: 'DELETE',
      body: JSON.stringify({ imageUrl, isLogo }),
    });
  },

  // Obter estatísticas públicas
  getStats: async () => {
    return await apiRequest('/api/establishments/stats');
  },

  // Buscar estabelecimentos por localização
  searchByLocation: async (lat, lng, radius = 5) => {
    return await apiRequest(`/api/establishments/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  },

  // Obter tipos de estabelecimento disponíveis
  getTypes: () => {
    return [
      'Boteco',
      'Choperia',
      'Petiscaria',
      'Restaurante',
      'Bar',
      'Pub',
      'Lanchonete',
      'Pizzaria',
      'Hamburgueria',
      'Sorveteria',
      'Cafeteria',
      'Padaria',
      'Outro'
    ];
  },

  // Obter bairros disponíveis (pode ser expandido com API)
  getNeighborhoods: () => {
    return [
      'Centro',
      'Copacabana',
      'Ipanema',
      'Leblon',
      'Barra da Tijuca',
      'Tijuca',
      'Vila Isabel',
      'Lapa',
      'Santa Teresa',
      'Botafogo',
      'Flamengo',
      'Laranjeiras',
      'Urca',
      'São Cristóvão',
      'Maracanã',
      'Grajaú',
      'Vila da Penha',
      'Penha',
      'Ilha do Governador',
      'Campo Grande',
      'Bangu',
      'Realengo',
      'Jacarepaguá',
      'Recreio',
      'Guaratiba',
      'Outro'
    ];
  },
};

