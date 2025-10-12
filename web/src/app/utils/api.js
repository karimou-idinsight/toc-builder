/**
 * API utility functions
 */

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : 'http://localhost:8080';

/**
 * Base fetch wrapper with error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} - API response
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * GET request wrapper
 * @param {string} endpoint - API endpoint
 * @returns {Promise} - API response
 */
export function apiGet(endpoint) {
  return apiRequest(endpoint, { method: 'GET' });
}

/**
 * POST request wrapper
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @returns {Promise} - API response
 */
export function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request wrapper
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @returns {Promise} - API response
 */
export function apiPut(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request wrapper
 * @param {string} endpoint - API endpoint
 * @returns {Promise} - API response
 */
export function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}