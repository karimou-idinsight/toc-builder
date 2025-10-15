/**
 * Permission utility functions for checking user capabilities on boards
 */

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  owner: 4,
  editor: 3,
  reviewer: 2,
  viewer: 1
};

/**
 * Check if user has at least the required role level
 * @param {string} userRole - The user's role on the board
 * @param {string} requiredRole - The minimum required role
 * @returns {boolean}
 */
export function hasRole(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Check if user can edit board content (nodes, edges, lists)
 * @param {string} userRole
 * @returns {boolean}
 */
export function canEdit(userRole) {
  return hasRole(userRole, 'editor');
}

/**
 * Check if user can add/view/edit comments
 * @param {string} userRole
 * @returns {boolean}
 */
export function canComment(userRole) {
  return hasRole(userRole, 'reviewer');
}

/**
 * Check if user can view the board
 * @param {string} userRole
 * @returns {boolean}
 */
export function canView(userRole) {
  return hasRole(userRole, 'viewer');
}

/**
 * Check if user is the board owner
 * @param {string} userRole
 * @returns {boolean}
 */
export function isOwner(userRole) {
  return userRole === 'owner';
}

/**
 * Check if user can manage permissions (invite users, change roles, etc.)
 * @param {string} userRole
 * @returns {boolean}
 */
export function canManagePermissions(userRole) {
  return isOwner(userRole);
}

/**
 * Check if user can delete the board
 * @param {string} userRole
 * @returns {boolean}
 */
export function canDeleteBoard(userRole) {
  return isOwner(userRole);
}

/**
 * Get a user-friendly description of the role
 * @param {string} role
 * @returns {string}
 */
export function getRoleDescription(role) {
  const descriptions = {
    owner: 'Full control over the board',
    editor: 'Can edit nodes, edges, and comment',
    reviewer: 'Can view and comment',
    viewer: 'Can only view the board'
  };
  return descriptions[role] || 'Unknown role';
}

/**
 * Get role badge color for UI
 * @param {string} role
 * @returns {string}
 */
export function getRoleBadgeColor(role) {
  const colors = {
    owner: '#8b5cf6', // purple
    editor: '#3b82f6', // blue
    reviewer: '#10b981', // green
    viewer: '#6b7280'  // gray
  };
  return colors[role] || '#6b7280';
}

