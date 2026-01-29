import axios from 'axios';

// ✅ Utilise la variable d'environnement
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

console.log('🚀 API URL:', API_BASE_URL); // Pour debug (à retirer en prod si tu veux)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // ✅ Timeout de 15 secondes
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH API =====
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  getCurrentUser: () => api.get('/auth/me'),
  changeEmail: (data) => api.post('/auth/change-email', data),
};

// ===== ROOMS API =====
export const roomsAPI = {
  getAll: () => api.get('/rooms'),
  getById: (id) => api.get(`/rooms/${id}`),
  getAvailable: (checkIn, checkOut) => 
    api.get(`/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}`),
  uploadPhoto: (formData) => {
    return api.post('/rooms/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  createWithUrls: (data) => api.post('/rooms/create-with-urls', data),
  update: (id, data) => api.put(`/admin/rooms/${id}`, data),
  delete: (id) => api.delete(`/admin/rooms/${id}`),
};

// ===== SERVICES API =====
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getByCategory: (category) => api.get(`/services/category/${category}`),
  create: (data) => api.post('/admin/services', data),
  update: (id, data) => api.put(`/admin/services/${id}`, data),
  delete: (id) => api.delete(`/admin/services/${id}`),
};

// ===== PACKS API =====
export const packsAPI = {
  getAll: () => api.get('/packs'),
  getById: (id) => api.get(`/packs/${id}`),
  create: (data) => api.post('/admin/packs', data),
  update: (id, data) => api.put(`/admin/packs/${id}`, data),
  delete: (id) => api.delete(`/admin/packs/${id}`),
};

// ===== BOOKINGS API =====
export const bookingsAPI = {
  // Endpoints publics (client)
  create: (data) => api.post('/bookings', data),
  getByReference: (reference) => api.get(`/bookings/reference/${reference}`),
  
  // Endpoints admin (nécessitent authentification)
  getAll: () => api.get('/admin/bookings'),
  getById: (id) => api.get(`/admin/bookings/${id}`),
  getCheckIns: () => api.get('/admin/bookings/checkins'),
  getCheckOuts: () => api.get('/admin/bookings/checkouts'),
  updateStatus: (id, status) => 
    api.put(`/admin/bookings/${id}/status?status=${status}`),
  updatePayment: (id, paymentStatus) =>
    api.put(`/admin/bookings/${id}/payment?paymentStatus=${paymentStatus}`),
  cancel: (id) => api.delete(`/admin/bookings/${id}`),
};

// ===== SETTINGS API =====
export const settingsAPI = {
  // ✅ ENDPOINT PUBLIC (accessible sans authentification)
  getSettings: () => api.get('/settings'),
  
  // Endpoints admin (nécessitent authentification)
  get: () => api.get('/admin/settings'),
  update: (data) => api.put('/admin/settings', data),
  updateDoorCode: (newCode) => api.put('/admin/settings/door-code', null, {
    params: { newCode }
  }),
};

// ===== PUBLIC API =====
export const publicAPI = {
  getHostelInfo: () => api.get('/public/hostel-info'),
  getPolicies: () => api.get('/public/policies'),
};

export default api;
