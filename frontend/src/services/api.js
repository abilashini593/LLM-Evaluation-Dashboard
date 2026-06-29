import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to append authorization token
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

export const authAPI = {
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const evaluationAPI = {
  run: async (prompt, models, parameters) => {
    const response = await api.post('/evaluations/run', { prompt, models, parameters });
    return response.data;
  },
  getAll: async (search = '', model = '', minScore = '') => {
    const params = {};
    if (search) params.search = search;
    if (model) params.model = model;
    if (minScore) params.minScore = minScore;
    
    const response = await api.get('/evaluations', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/evaluations/${id}`);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/evaluations/${id}`);
    return response.data;
  },
};

export const testCaseAPI = {
  getAll: async () => {
    const response = await api.get('/test-cases');
    return response.data;
  },
  create: async (testCaseData) => {
    const response = await api.post('/test-cases', testCaseData);
    return response.data;
  },
  update: async (id, testCaseData) => {
    const response = await api.put(`/test-cases/${id}`, testCaseData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/test-cases/${id}`);
    return response.data;
  },
};

export const analyticsAPI = {
  getLeaderboard: async () => {
    const response = await api.get('/analytics/leaderboard');
    return response.data;
  },
  getCharts: async () => {
    const response = await api.get('/analytics/charts');
    return response.data;
  },
};

export default api;
