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
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data;
};

// Boards API functions
export const boardsApi = {
  // Get all boards for current user
  async getMyBoards() {
    const response = await fetch(`${API_URL}/api/boards`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get specific board
  async getBoard(boardId) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Create new board
  async createBoard(boardData) {
    // Map 'name' to 'title' for backend compatibility
    const backendData = {
      ...boardData,
      title: boardData.name || boardData.title,
    };
    delete backendData.name;
    
    const response = await fetch(`${API_URL}/api/boards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(backendData)
    });
    return handleResponse(response);
  },

  // Update board
  async updateBoard(boardId, boardData) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(boardData)
    });
    return handleResponse(response);
  },

  // Delete board
  async deleteBoard(boardId) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get board permissions
  async getBoardPermissions(boardId) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/permissions`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Add user to board
  async addBoardPermission(boardId, permissionData) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/permissions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(permissionData)
    });
    return handleResponse(response);
  },

  // Update board permission
  async updateBoardPermission(boardId, userId, permissionData) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/permissions/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(permissionData)
    });
    return handleResponse(response);
  },

  // Remove user from board
  async removeBoardPermission(boardId, userId) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/permissions/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

