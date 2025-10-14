// Use relative URLs in production (same server), full URL in development if needed
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic API request handler
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle 401 - try to refresh token
      if (response.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          // Retry request with new token
          config.headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, config);
          const retryData = await retryResponse.json();
          
          if (!retryResponse.ok) {
            throw new Error(retryData.error || 'Request failed');
          }
          
          return retryData;
        }
      }

      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// Refresh token helper
async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.accessToken;
    }

    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

// Authentication API
export const authApi = {
  login: (email, password) => 
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (userData) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  logout: () =>
    apiRequest('/api/auth/logout', {
      method: 'POST'
    }),

  me: () =>
    apiRequest('/api/auth/me'),

  forgotPassword: (email) =>
    apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  resetPassword: (token, newPassword) =>
    apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    }),

  verifyEmail: (token) =>
    apiRequest('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
};

// User API
export const userApi = {
  getProfile: () =>
    apiRequest('/api/users/profile'),

  updateProfile: (data) =>
    apiRequest('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  changePassword: (currentPassword, newPassword) =>
    apiRequest('/api/users/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    }),

  deactivateAccount: (password) =>
    apiRequest('/api/users/account', {
      method: 'DELETE',
      body: JSON.stringify({ password })
    }),

  getBoards: () =>
    apiRequest('/api/users/boards'),

  searchUsers: (query, limit = 10) =>
    apiRequest(`/api/users/search?q=${encodeURIComponent(query)}&limit=${limit}`),

  getStats: () =>
    apiRequest('/api/users/stats')
};

// Board API
export const boardApi = {
  getAll: () =>
    apiRequest('/api/boards'),

  getPublic: (limit = 20, offset = 0) =>
    apiRequest(`/api/boards/public?limit=${limit}&offset=${offset}`),

  create: (boardData) =>
    apiRequest('/api/boards', {
      method: 'POST',
      body: JSON.stringify(boardData)
    }),

  getById: (boardId) =>
    apiRequest(`/api/boards/${boardId}`),

  update: (boardId, data) =>
    apiRequest(`/api/boards/${boardId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: (boardId) =>
    apiRequest(`/api/boards/${boardId}`, {
      method: 'DELETE'
    }),

  getPermissions: (boardId) =>
    apiRequest(`/api/boards/${boardId}/permissions`),

  addPermission: (boardId, userId, role) =>
    apiRequest(`/api/boards/${boardId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, role })
    }),

  updatePermission: (boardId, userId, role) =>
    apiRequest(`/api/boards/${boardId}/permissions/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    }),

  removePermission: (boardId, userId) =>
    apiRequest(`/api/boards/${boardId}/permissions/${userId}`, {
      method: 'DELETE'
    }),

  inviteUser: (boardId, email, role) =>
    apiRequest(`/api/boards/${boardId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email, role })
    }),

  getInvitations: (boardId) =>
    apiRequest(`/api/boards/${boardId}/invitations`),

  acceptInvitation: (token) =>
    apiRequest(`/api/boards/invitations/${token}/accept`, {
      method: 'POST'
    }),

  declineInvitation: (token) =>
    apiRequest(`/api/boards/invitations/${token}/decline`, {
      method: 'POST'
    }),

  getPendingInvitations: () =>
    apiRequest('/api/boards/invitations/pending')
};

// Admin API (Super Admin only)
export const adminApi = {
  getAllUsers: (limit = 50, offset = 0) =>
    apiRequest(`/api/admin/users?limit=${limit}&offset=${offset}`),

  getUser: (userId) =>
    apiRequest(`/api/admin/users/${userId}`),

  createUser: (userData) =>
    apiRequest('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  updateUser: (userId, data) =>
    apiRequest(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deactivateUser: (userId) =>
    apiRequest(`/api/admin/users/${userId}/deactivate`, {
      method: 'PUT'
    }),

  activateUser: (userId) =>
    apiRequest(`/api/admin/users/${userId}/activate`, {
      method: 'PUT'
    }),

  resetUserPassword: (userId, newPassword) =>
    apiRequest(`/api/admin/users/${userId}/reset-password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword })
    }),

  getStats: () =>
    apiRequest('/api/admin/stats')
};

export default apiRequest;
