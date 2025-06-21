// Configuração da API
export const API_BASE_URL = import.meta.env.PROD
  ? "https://barzinhos-api.onrender.com"
  : "http://localhost:5000";

// Função para fazer requisições HTTP
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Adicionar token de autenticação se existir
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Função para upload de arquivos
export const uploadFiles = async (endpoint, files, additionalData = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const formData = new FormData();
  
  // Adicionar arquivos
  if (Array.isArray(files)) {
    files.forEach((file, index) => {
      formData.append('images', file);
    });
  } else if (files) {
    formData.append('images', files);
  }

  // Adicionar dados adicionais
  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key]);
  });

  const config = {
    method: 'POST',
    body: formData,
    headers: {},
  };

  // Adicionar token de autenticação se existir
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};

