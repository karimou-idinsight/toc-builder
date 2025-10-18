'use client';

import { useState } from 'react';
import { adminApi } from '../utils/adminApi';
import { adminUsersPageStyles } from '../styles/AdminUsersPage.styles';

export default function EditUserModal({ user, onClose, onSuccess }) {
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