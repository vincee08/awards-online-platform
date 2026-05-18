import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({
  baseURL: '/api',
});

// Automatically attach Firebase ID Token to all admin requests
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const awardsApi = {
  getAll: () => api.get('/awards'),
  getById: (id: string) => api.get(`/awards/${id}`),
  create: (data: any) => api.post('/admin/awards', data),
  update: (id: string, data: any) => api.put(`/admin/awards/${id}`, data),
  delete: (id: string) => api.delete(`/admin/awards/${id}`),
};

export const adminApi = {
  getProfile: () => api.get('/admin/profile'),
  createAward: (data: any) => api.post('/admin/awards', data),
  updateAward: (id: string, data: any) => api.put(`/admin/awards`, { id, ...data }),
  archiveAward: (id: string) => api.patch('/admin/awards', { id, action: 'archive' }),
  getUsers: () => api.get('/admin/users'),
  updateUserStatus: (id: string, status: string) => api.patch(`/admin/users/${id}/status`, { status }),
  updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  getStats: () => api.get('/admin/stats'),
  getAwardById: (id: string) => api.get('/admin/awards', { params: { id } }),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default api;
