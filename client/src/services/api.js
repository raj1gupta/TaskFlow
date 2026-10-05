import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration & standardized error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized and not already on the auth endpoint, clear token
      if (!error.config.url.includes('/auth/send-otp') && !error.config.url.includes('/auth/verify-otp')) {
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  sendOtp: async (email) => {
    const res = await api.post('/auth/send-otp', { email });
    return res.data;
  },
  verifyOtp: async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  },
  googleAuth: async (payload) => {
    const res = await api.post('/auth/google', payload);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
};

// Task Service
export const taskService = {
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.order) params.append('order', filters.order);

    const res = await api.get(`/tasks?${params.toString()}`);
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/tasks/stats/summary');
    return res.data;
  },
  getTaskById: async (id) => {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  },
  createTask: async (taskData) => {
    const res = await api.post('/tasks', taskData);
    return res.data;
  },
  updateTask: async (id, taskData) => {
    const res = await api.put(`/tasks/${id}`, taskData);
    return res.data;
  },
  deleteTask: async (id) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },
};

export default api;
