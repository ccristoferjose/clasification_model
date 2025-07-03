// API configuration for handling different environments
const API_BASE_URL = import.meta.env.PROD 
  ? 'http://15.222.200.111:3000'  // Production: direct to backend
  : '';  // Development: use Vite proxy

// API utility functions
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Specific API endpoints
export const api = {
  // Departamentos
  getDepartamentos: () => apiCall('/api/departamentos'),
  
  // Municipios
  getMunicipios: (departamentoId) => apiCall(`/api/municipios/${departamentoId}`),
  
  // Predictions
  predict: (data) => apiCall('/api/predict', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Cause predictions
  predictCausas: (data) => apiCall('/api/predict_causas', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
}; 