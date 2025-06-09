import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  
  getMe: () => api.get('/api/auth/me'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
};

// Appointments API
export const appointmentAPI = {
  getAll: () => api.get('/api/appointments'),
  getById: (id: number) => api.get(`/api/appointments/${id}`),
  create: (data: any) => api.post('/api/appointments', data),
  update: (id: number, data: any) => api.put(`/api/appointments/${id}`, data),
  delete: (id: number) => api.delete(`/api/appointments/${id}`),
};

// Prescriptions API
export const prescriptionAPI = {
  getAll: () => api.get('/api/prescriptions'),
  getById: (id: number) => api.get(`/api/prescriptions/${id}`),
  create: (data: any) => api.post('/api/prescriptions', data),
  update: (id: number, data: any) => api.put(`/api/prescriptions/${id}`, data),
  finalize: (id: number) => api.post(`/api/prescriptions/${id}/finalize`),
};

// AI API
export const aiAPI = {
  checkInteractions: (medications: any[]) =>
    api.post('/api/ai/check', { medications }),
};

// Share API
export const shareAPI = {
  getByToken: (token: string) => api.get(`/api/share/${token}`),
  revokeToken: (tokenId: number) => api.post(`/api/share/${tokenId}/revoke`),
};