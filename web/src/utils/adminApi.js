// Use relative URLs in production (same server), full URL in development if needed
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Handle API errors
const handleResponse = async (response) => {
  let data;
  
  // Try to parse JSON, but handle cases where response is not JSON
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    // If parsing fails, response wasn't JSON
    throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}`);
  }
  
  if (!response.ok) {
    throw new Error(data.error || data.message || 'API request failed');
  }
  
  return data;
};

// Admin API functions
export const adminApi = {
  // Get all users
  async getAllUsers(limit = 50, offset = 0) {
    const response = await fetch(
      `${API_URL}/api/admin/users?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );
    return handleResponse(response);
  },

  // Get specific user
  async getUser(userId) {
    const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Create new user
  async createUser(userData) {
    const response = await fetch(`${API_URL}/api/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Update user
  async updateUser(userId, userData) {
    const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Deactivate user
  async deactivateUser(userId) {
    const response = await fetch(`${API_URL}/api/admin/users/${userId}/deactivate`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Activate user
  async activateUser(userId) {
    const response = await fetch(`${API_URL}/api/admin/users/${userId}/activate`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Reset user password
  async resetUserPassword(userId, newPassword) {
    const response = await fetch(`${API_URL}/api/admin/users/${userId}/reset-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPassword })
    });
    return handleResponse(response);
  },

  // Get system statistics
  async getStats() {
    const response = await fetch(`${API_URL}/api/admin/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

