import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
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
    api.post('/auth/login', { email, password }),
  
  getMe: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
};

// Appointments API
export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  getById: (id: number) => api.get(`/appointments/${id}`),
  create: (data: any) => api.post('/appointments', data),
  update: (id: number, data: any) => api.put(`/appointments/${id}`, data),
  delete: (id: number) => api.delete(`/appointments/${id}`),
};

// Prescriptions API
export const prescriptionAPI = {
  getAll: () => api.get('/prescriptions'),
  getById: (id: number) => api.get(`/prescriptions/${id}`),
  create: (data: any) => api.post('/prescriptions', data),
  update: (id: number, data: any) => api.put(`/prescriptions/${id}`, data),
  finalize: (id: number) => api.post(`/prescriptions/${id}/finalize`),
};

// AI API
export const aiAPI = {
  checkInteractions: (medications: any[]) =>
    api.post('/ai/check-interactions', { medications }),
};

// Share API
export const shareAPI = {
  getByToken: (token: string) => api.get(`/share/${token}`),
  revokeToken: (tokenId: number) => api.post(`/share/${tokenId}/revoke`),
};