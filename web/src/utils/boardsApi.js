// Use relative URLs in production (same server), full URL in development if needed
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Only add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
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
  },

  // Search users (for adding to boards)
  async searchUsers(query, limit = 10) {
    const response = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get full board data (board + lists + nodes + edges)
  async getBoardData(boardId) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/data`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Board Lists
  async createList(boardId, listData) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/lists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(listData)
    });
    return handleResponse(response);
  },

  async updateList(boardId, listId, listData) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/lists/${listId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(listData)
    });
    return handleResponse(response);
  },

  async deleteList(boardId, listId) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/lists/${listId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async reorderLists(boardId, listIds) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/lists-order`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ listIds })
    });
    return handleResponse(response);
  },

  // Node comments
  async getNodeComments(boardId, nodeId) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/nodes/${nodeId}/comments`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async createNodeComment(boardId, nodeId, content) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/nodes/${nodeId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    return handleResponse(response);
  },

  async updateNodeComment(boardId, nodeId, commentId, updates) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/nodes/${nodeId}/comments/${commentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse(response);
  },

  // Edge comments
  async getEdgeComments(boardId, edgeId) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/edges/${edgeId}/comments`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async createEdgeComment(boardId, edgeId, content) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/edges/${edgeId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    return handleResponse(response);
  },

  async updateEdgeComment(boardId, edgeId, commentId, updates) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/edges/${edgeId}/comments/${commentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse(response);
  },

  // Edge assumptions
  async getEdgeAssumptions(boardId, edgeId) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/edges/${edgeId}/assumptions`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async createEdgeAssumption(boardId, edgeId, content, strength = 'medium') {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/edges/${edgeId}/assumptions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, strength })
    });
    return handleResponse(response);
  },

  async updateEdgeAssumption(boardId, edgeId, assumptionId, updates) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/edges/${edgeId}/assumptions/${assumptionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse(response);
  },

  async deleteEdgeAssumption(boardId, edgeId, assumptionId) {
    const response = await fetch(`${API_URL}/api/boards/${boardId}/edges/${edgeId}/assumptions/${assumptionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

