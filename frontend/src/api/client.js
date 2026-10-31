import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT access token to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('threatlens_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new Event('threatlens:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const dashboardApi = {
  getMetrics: () => api.get('/dashboard/metrics'),
};

export const logsApi = {
  getLogs: (params) => api.get('/logs', { params }),
  createLog: (logData) => api.post('/logs', logData),
  analyzeLog: (logData) => api.post('/logs/analyze', logData),
};

export const alertsApi = {
  getAlerts: (params) => api.get('/alerts', { params }),
  getAlert: (id) => api.get(`/alerts/${id}`),
  updateAlert: (id, updates) => api.patch(`/alerts/${id}`, updates),
  escalateAlert: (id, data) => api.post(`/alerts/${id}/escalate`, data),
};

export const incidentsApi = {
  getIncidents: (params) => api.get('/incidents', { params }),
  getIncident: (id) => api.get(`/incidents/${id}`),
  createIncident: (data) => api.post('/incidents', data),
  updateIncident: (id, updates) => api.patch(`/incidents/${id}`, updates),
  addAction: (id, actionData) => api.post(`/incidents/${id}/actions`, actionData),
};

export const phishingApi = {
  analyze: (data) => api.post('/phishing/analyze', data),
  getReports: (params) => api.get('/phishing/reports', { params }),
};

export const aiApi = {
  explainAlert: (data) => api.post('/ai/explain-alert', data),
  incidentResponse: (data) => api.post('/ai/incident-response', data),
  explainPhishing: (data) => api.post('/ai/explain-phishing', data),
};

export const devicesApi = {
  getDevices: (params) => api.get('/devices', { params }),
  createDevice: (data) => api.post('/devices', data),
  updateDevice: (id, updates) => api.patch(`/devices/${id}`, updates),
};

export const policiesApi = {
  getPolicies: () => api.get('/policies'),
  createPolicy: (data) => api.post('/policies', data),
  updatePolicy: (id, updates) => api.patch(`/policies/${id}`, updates),
};

export const usersApi = {
  getUsers: (params) => api.get('/users', { params }),
  createUser: (data) => api.post('/users', data),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
};

export default api;
