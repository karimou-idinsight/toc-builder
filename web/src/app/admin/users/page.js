'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../context/AuthContext';
import { adminApi } from '../../../utils/adminApi';
import { adminUsersPageStyles } from '../../../styles/AdminUsersPage.styles';

export default function UsersManagement() {
  return (
    <ProtectedRoute requireSuperAdmin={true}>
      <UsersManagementContent />
    </ProtectedRoute>
  );
}

function UsersManagementContent() {
  const router = useRouter();
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getAllUsers(limit, page * limit);
      setUsers(data.users);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleToggleActive = async (user) => {
    try {
      if (user.is_active) {
        await adminApi.deactivateUser(user.id);
      } else {
        await adminApi.activateUser(user.id);
      }
      loadUsers();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div style={adminUsersPageStyles.container}>
      {/* Header */}
      <header style={adminUsersPageStyles.header}>
        <div style={adminUsersPageStyles.headerContent}>
          <div>
            <button
              onClick={() => router.push('/admin')}
              style={adminUsersPageStyles.backButton}
            >
              ← Back to Dashboard
            </button>
            <h1 style={adminUsersPageStyles.title}>User Management</h1>
            <p style={adminUsersPageStyles.subtitle}>
              Manage all users in the system ({totalCount} total)
            </p>
          </div>
          <div style={adminUsersPageStyles.headerActions}>
            <button onClick={handleCreateUser} style={adminUsersPageStyles.primaryButton}>
              + Create User
            </button>
            <button onClick={logout} style={adminUsersPageStyles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={adminUsersPageStyles.main}>
        {error && (
          <div style={adminUsersPageStyles.errorBanner}>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div style={adminUsersPageStyles.loadingContainer}>
            <div style={adminUsersPageStyles.spinner}></div>
            <p style={adminUsersPageStyles.loadingText}>Loading users...</p>
          </div>
        ) : (
          <>
            {/* Users Table */}
            <div style={adminUsersPageStyles.tableContainer}>
              <table style={adminUsersPageStyles.table}>
                <thead>
                  <tr style={adminUsersPageStyles.tableHeaderRow}>
                    <th style={adminUsersPageStyles.tableHeader}>Name</th>
                    <th style={adminUsersPageStyles.tableHeader}>Email</th>
                    <th style={adminUsersPageStyles.tableHeader}>Role</th>
                    <th style={adminUsersPageStyles.tableHeader}>Status</th>
                    <th style={adminUsersPageStyles.tableHeader}>Verified</th>
                    <th style={adminUsersPageStyles.tableHeader}>Created</th>
                    <th style={adminUsersPageStyles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={adminUsersPageStyles.tableRow}>
                      <td style={adminUsersPageStyles.tableCell}>
                        <div style={adminUsersPageStyles.userInfo}>
                          <div style={adminUsersPageStyles.avatar}>
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </div>
                          <div>
                            <div style={adminUsersPageStyles.userName}>
                              {user.first_name} {user.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={adminUsersPageStyles.tableCell}>{user.email}</td>
                      <td style={adminUsersPageStyles.tableCell}>
                        <span
                          style={{
                            ...adminUsersPageStyles.badge,
                            ...(user.role === 'super_admin'
                              ? adminUsersPageStyles.badgeSuperAdmin
                              : adminUsersPageStyles.badgeUser)
                          }}
                        >
                          {user.role === 'super_admin' ? 'Super Admin' : 'User'}
                        </span>
                      </td>
                      <td style={adminUsersPageStyles.tableCell}>
                        <span
                          style={{
                            ...adminUsersPageStyles.badge,
                            ...(user.is_active
                              ? adminUsersPageStyles.badgeActive
                              : adminUsersPageStyles.badgeInactive)
                          }}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={adminUsersPageStyles.tableCell}>
                        {user.email_verified ? '✅' : '—'}
                      </td>
                      <td style={adminUsersPageStyles.tableCell}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td style={adminUsersPageStyles.tableCell}>
                        <div style={adminUsersPageStyles.actionButtons}>
                          <button
                            onClick={() => handleEditUser(user)}
                            style={adminUsersPageStyles.editButton}
                            title="Edit user"
                          >
                            ✏️
                          </button>
                          {user.role !== 'super_admin' && (
                            <button
                              onClick={() => handleToggleActive(user)}
                              style={adminUsersPageStyles.toggleButton}
                              title={user.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {user.is_active ? '🔒' : '🔓'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={adminUsersPageStyles.pagination}>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  style={{
                    ...adminUsersPageStyles.paginationButton,
                    ...(page === 0 && adminUsersPageStyles.paginationButtonDisabled)
                  }}
                >
                  Previous
                </button>
                <span style={adminUsersPageStyles.paginationInfo}>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  style={{
                    ...adminUsersPageStyles.paginationButton,
                    ...(page >= totalPages - 1 && adminUsersPageStyles.paginationButtonDisabled)
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadUsers();
          }}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            loadUsers();
          }}
        />
      )}
    </div>
  );
}

// Create User Modal Component
function CreateUserModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await adminApi.createUser(formData);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={adminUsersPageStyles.modalOverlay} onClick={onClose}>
      <div style={adminUsersPageStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={adminUsersPageStyles.modalTitle}>Create New User</h2>
        
        {error && (
          <div style={adminUsersPageStyles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={adminUsersPageStyles.form}>
          <div style={adminUsersPageStyles.formGroup}>
            <label style={adminUsersPageStyles.label}>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={adminUsersPageStyles.input}
              required
            />
          </div>

          <div style={adminUsersPageStyles.formGroup}>
            <label style={adminUsersPageStyles.label}>Password * (min 8 characters)</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={adminUsersPageStyles.input}
              minLength={8}
              required
            />
          </div>

          <div style={adminUsersPageStyles.formRow}>
            <div style={adminUsersPageStyles.formGroup}>
              <label style={adminUsersPageStyles.label}>First Name *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                style={adminUsersPageStyles.input}
                required
              />
            </div>

            <div style={adminUsersPageStyles.formGroup}>
              <label style={adminUsersPageStyles.label}>Last Name *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                style={adminUsersPageStyles.input}
                required
              />
            </div>
          </div>

          <div style={adminUsersPageStyles.formGroup}>
            <label style={adminUsersPageStyles.label}>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={adminUsersPageStyles.select}
            >
              <option value="user">User</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div style={adminUsersPageStyles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              style={adminUsersPageStyles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={adminUsersPageStyles.submitButton}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    is_active: user.is_active
  });
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Update user details
      await adminApi.updateUser(user.id, formData);
      
      // Reset password if provided
      if (newPassword && newPassword.length >= 8) {
        await adminApi.resetUserPassword(user.id, newPassword);
      }
      
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={adminUsersPageStyles.modalOverlay} onClick={onClose}>
      <div style={adminUsersPageStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={adminUsersPageStyles.modalTitle}>Edit User</h2>
        
        {error && (
          <div style={adminUsersPageStyles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={adminUsersPageStyles.form}>
          <div style={adminUsersPageStyles.formRow}>
            <div style={adminUsersPageStyles.formGroup}>
              <label style={adminUsersPageStyles.label}>First Name *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                style={adminUsersPageStyles.input}
                required
              />
            </div>

            <div style={adminUsersPageStyles.formGroup}>
              <label style={adminUsersPageStyles.label}>Last Name *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                style={adminUsersPageStyles.input}
                required
              />
            </div>
          </div>

          <div style={adminUsersPageStyles.formGroup}>
            <label style={adminUsersPageStyles.label}>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={adminUsersPageStyles.select}
            >
              <option value="user">User</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div style={adminUsersPageStyles.formGroup}>
            <label style={adminUsersPageStyles.label}>
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={adminUsersPageStyles.input}
              placeholder="Min 8 characters"
              minLength={8}
            />
          </div>

          <div style={adminUsersPageStyles.formGroup}>
            <label style={adminUsersPageStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                style={adminUsersPageStyles.checkbox}
              />
              Active
            </label>
          </div>

          <div style={adminUsersPageStyles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              style={adminUsersPageStyles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={adminUsersPageStyles.submitButton}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Styles moved to ../../../styles/AdminUsersPage.styles.js
