import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('codebuddy_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle responses and auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear and optionally trigger re-login
      if (localStorage.getItem('codebuddy_token')) {
        console.warn('Session expired. Please log in again.');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Problems & DSA
export const problemsAPI = {
  getProblems: (params) => api.get('/problems', { params }),
  getProblem: (id) => api.get(`/problems/${id}`),
  runCode: (id, data) => api.post(`/problems/${id}/run`, data),
  submitSolution: (id, data) => api.post(`/problems/${id}/submit`, data),
  toggleBookmark: (id) => api.post(`/problems/${id}/bookmark`),
  getSubmissions: (params) => api.get('/problems/submissions', { params }),
};

// Online Code Editor Playground
export const codeAPI = {
  runCode: (data) => api.post('/code/run', data),
  getLanguages: () => api.get('/code/languages'),
};

// Saved Snippets
export const snippetsAPI = {
  getSnippets: (params) => api.get('/snippets', { params }),
  getSnippet: (id) => api.get(`/snippets/${id}`),
  createSnippet: (data) => api.post('/snippets', data),
  updateSnippet: (id, data) => api.put(`/snippets/${id}`, data),
  deleteSnippet: (id) => api.delete(`/snippets/${id}`),
  duplicateSnippet: (id) => api.post(`/snippets/${id}/duplicate`),
};

// AI Assistant
export const aiAPI = {
  getStatus: () => api.get('/ai/status'),
  getModels: () => api.get('/ai/models'),
  chat: (data) => api.post('/ai/chat', data),
  explain: (data) => api.post('/ai/explain', data),
  debug: (data) => api.post('/ai/debug', data),
  convert: (data) => api.post('/ai/convert', data),
  complexity: (data) => api.post('/ai/complexity', data),
};

// Study Hub & Learning Resources
export const studyAPI = {
  getVisualSheets: () => api.get('/study/visual-sheets'),
  getFlashcards: (params) => api.get('/study/flashcards', { params }),
  getRoadmaps: () => api.get('/study/roadmaps'),
  getBigO: () => api.get('/study/big-o'),
};

// Peer Learning Community
export const communityAPI = {
  getQuestions: (params) => api.get('/community/questions', { params }),
  getQuestion: (id) => api.get(`/community/questions/${id}`),
  createQuestion: (data) => api.post('/community/questions', data),
  postAnswer: (id, data) => api.post(`/community/questions/${id}/answers`, data),
  voteQuestion: (id, data) => api.post(`/community/questions/${id}/vote`, data),
  voteAnswer: (id, data) => api.post(`/community/answers/${id}/vote`, data),
  acceptAnswer: (questionId, answerId) => api.post(`/community/questions/${questionId}/accept-answer`, { answer_id: answerId }),
  toggleBookmark: (id) => api.post(`/community/questions/${id}/bookmark`),
  addComment: (data) => api.post('/community/comments', data),
};

// Mentors
export const mentorsAPI = {
  getMentors: (params) => api.get('/mentors', { params }),
  getMentor: (id) => api.get(`/mentors/${id}`),
  requestSession: (data) => api.post('/mentors/request', data),
  getMySessions: () => api.get('/mentors/my-sessions'),
  updateSessionStatus: (id, data) => api.put(`/mentors/requests/${id}/status`, data),
  rateSession: (id, data) => api.post(`/mentors/requests/${id}/rate`, data),
};

// Contests
export const contestsAPI = {
  getContests: (params) => api.get('/contests', { params }),
  getContest: (id) => api.get(`/contests/${id}`),
  register: (id) => api.post(`/contests/${id}/register`),
  getLeaderboard: (id) => api.get(`/contests/${id}/leaderboard`),
  createContest: (data) => api.post('/contests', data),
};

// Dashboard & Stats
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
  getLeaderboard: (params) => api.get('/dashboard/leaderboard', { params }),
};

// Notifications
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  listUsers: (params) => api.get('/admin/users', { params }),
  updateRole: (userId, data) => api.put(`/admin/users/${userId}/role`, data),
  toggleStatus: (userId, data) => api.put(`/admin/users/${userId}/status`, data),
  createProblem: (data) => api.post('/admin/problems', data),
  deleteProblem: (id) => api.delete(`/admin/problems/${id}`),
  getAuditLogs: () => api.get('/admin/audit-logs'),
};

export default api;
