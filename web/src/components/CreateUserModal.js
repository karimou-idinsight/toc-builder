'use client';

import { useState } from 'react';
import { adminApi } from '../utils/adminApi';
import { adminUsersPageStyles } from '../styles/AdminUsersPage.styles';

export default function CreateUserModal({ onClose, onSuccess }) {
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