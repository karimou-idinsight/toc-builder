'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { boardsApi } from '../utils/boardsApi';
import { boardsPageStyles } from '../styles/BoardsPage.styles';

export default function CreateBoardModal({ onClose, onSuccess }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = await boardsApi.createBoard(formData);
      // Redirect to the newly created board
      router.push(`/board/${data.board.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={boardsPageStyles.modalOverlay} onClick={onClose}>
      <div style={boardsPageStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={boardsPageStyles.modalTitle}>Create New Board</h2>
        
        {error && (
          <div style={boardsPageStyles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={boardsPageStyles.form}>
          <div style={boardsPageStyles.formGroup}>
            <label style={boardsPageStyles.label}>Board Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={boardsPageStyles.input}
              placeholder="e.g., Community Health Initiative"
              required
              autoFocus
            />
          </div>

          <div style={boardsPageStyles.formGroup}>
            <label style={boardsPageStyles.label}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ ...boardsPageStyles.input, minHeight: '100px', resize: 'vertical' }}
              placeholder="Brief description of this Theory of Change..."
            />
          </div>

          <div style={boardsPageStyles.formGroup}>
            <label style={boardsPageStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                style={boardsPageStyles.checkbox}
              />
              Make this board public (anyone can view)
            </label>
          </div>

          <div style={boardsPageStyles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              style={boardsPageStyles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={boardsPageStyles.submitButton}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
