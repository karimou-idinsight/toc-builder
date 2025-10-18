'use client';

import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { boardsApi } from '../../utils/boardsApi';

export default function BoardsPage() {
  return (
    <ProtectedRoute>
      <BoardsPageContent />
    </ProtectedRoute>
  );
}

function BoardsPageContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [manageBoardId, setManageBoardId] = useState(null);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await boardsApi.getMyBoards();
      setBoards(data.boards || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBoard = async (boardId, boardName) => {
    if (!confirm(`Are you sure you want to delete "${boardName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await boardsApi.deleteBoard(boardId);
      loadBoards();
    } catch (err) {
      alert(`Error deleting board: ${err.message}`);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner':
        return styles.badgeOwner;
      case 'contributor':
        return styles.badgeContributor;
      case 'reviewer':
        return styles.badgeReviewer;
      default:
        return styles.badgeViewer;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>My Boards</h1>
            <p style={styles.subtitle}>
              Welcome back, {user?.first_name} {user?.last_name}
            </p>
          </div>
          <div style={styles.headerActions}>
            <button
              onClick={() => setShowCreateModal(true)}
              style={styles.primaryButton}
            >
              + New Board
            </button>
            {user?.role === 'super_admin' && (
              <button
                onClick={() => router.push('/admin')}
                style={styles.secondaryButton}
              >
                Admin Dashboard
              </button>
            )}
            <button onClick={logout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {error && (
          <div style={styles.errorBanner}>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading boards...</p>
          </div>
        ) : boards.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📊</div>
            <h2 style={styles.emptyTitle}>No boards yet</h2>
            <p style={styles.emptyText}>
              Create your first Theory of Change board to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={styles.createButton}
            >
              + Create Your First Board
            </button>
          </div>
        ) : (
          <div style={styles.boardsGrid}>
            {boards.map((board) => (
              <div key={board.id} style={styles.boardCard}>
                <div style={styles.boardCardHeader}>
                  <div>
                    <h3 style={styles.boardTitle}>{board.name}</h3>
                    {board.description && (
                      <p style={styles.boardDescription}>{board.description}</p>
                    )}
                  </div>
                  <span style={{ ...styles.roleBadge, ...getRoleBadgeColor(board.role) }}>
                    {board.role}
                  </span>
                </div>

                <div style={styles.boardMeta}>
                  <div style={styles.metaItem}>
                    <span style={styles.metaIcon}>👥</span>
                    <span style={styles.metaText}>
                      {board.collaborator_count || 1} {board.collaborator_count === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaIcon}>
                      {board.is_public ? '🌐' : '🔒'}
                    </span>
                    <span style={styles.metaText}>
                      {board.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaIcon}>📅</span>
                    <span style={styles.metaText}>
                      {new Date(board.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div style={styles.boardActions}>
                  <button
                    onClick={() => router.push(`/board/${board.id}`)}
                    style={styles.openButton}
                  >
                    Open Board
                  </button>
                {board.role === 'owner' && (
                  <button
                    onClick={() => setManageBoardId(board.id)}
                    style={styles.secondaryButton}
                    title="Manage access"
                  >
                    Manage Access
                  </button>
                )}
                  {board.role === 'owner' && (
                    <button
                      onClick={() => handleDeleteBoard(board.id, board.name)}
                      style={styles.deleteButton}
                      title="Delete board"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadBoards();
          }}
        />
      )}

      {/* Manage Access Modal */}
      {manageBoardId && (
        <ManageAccessModal
          boardId={manageBoardId}
          onClose={() => setManageBoardId(null)}
          onChanged={loadBoards}
        />
      )}
    </div>
  );
}

// Create Board Modal Component
function CreateBoardModal({ onClose, onSuccess }) {
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
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Create New Board</h2>
        
        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Board Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={styles.input}
              placeholder="e.g., Community Health Initiative"
              required
              autoFocus
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
              placeholder="Brief description of this Theory of Change..."
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                style={styles.checkbox}
              />
              Make this board public (anyone can view)
            </label>
          </div>

          <div style={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
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

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '1.5rem 2rem',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: '0.25rem 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  primaryButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  secondaryButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: 'white',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  logoutButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '1rem',
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1.5rem',
    color: '#991b1b',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1.5rem',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.5rem',
  },
  emptyText: {
    fontSize: '1rem',
    color: '#64748b',
    marginBottom: '2rem',
  },
  createButton: {
    padding: '0.875rem 2rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  boardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  boardCard: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  boardCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  boardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 0.5rem',
  },
  boardDescription: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: 0,
    lineHeight: '1.5',
  },
  roleBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
  },
  badgeOwner: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  badgeContributor: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  badgeReviewer: {
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
  },
  badgeViewer: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
  boardMeta: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  metaIcon: {
    fontSize: '1rem',
  },
  metaText: {
    fontSize: '0.875rem',
    color: '#64748b',
  },
  boardActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: 'auto',
  },
  openButton: {
    flex: 1,
    padding: '0.625rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  deleteButton: {
    padding: '0.625rem 0.75rem',
    backgroundColor: 'transparent',
    border: '1px solid #e5e7eb',
    borderRadius: '0.375rem',
    fontSize: '1.125rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '2rem',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '1.5rem',
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '0.375rem',
    padding: '0.75rem',
    marginBottom: '1rem',
    color: '#991b1b',
    fontSize: '0.875rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '0.625rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#374151',
  },
  checkbox: {
    width: '1rem',
    height: '1rem',
  },
  modalActions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
  cancelButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: 'white',
    color: '#64748b',
    border: '1px solid #cbd5e1',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

// Manage Access Modal Component
function ManageAccessModal({ boardId, onClose, onChanged }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [roleToAdd, setRoleToAdd] = useState('viewer');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await boardsApi.getBoardPermissions(boardId);
        setPermissions(data.permissions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [boardId]);

  const refreshPermissions = async () => {
    const data = await boardsApi.getBoardPermissions(boardId);
    setPermissions(data.permissions || []);
  };

  const handleSearch = async (q) => {
    setSearch(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await boardsApi.searchUsers(q, 8);
      setSearchResults(res.users || []);
    } catch (err) {
      // ignore
    }
  };

  const handleAdd = async (userId) => {
    try {
      await boardsApi.addBoardPermission(boardId, { user_id: userId, role: roleToAdd });
      setSearch('');
      setSearchResults([]);
      await refreshPermissions();
      if (onChanged) onChanged();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await boardsApi.updateBoardPermission(boardId, userId, { role });
      await refreshPermissions();
      if (onChanged) onChanged();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Remove this user from the board?')) return;
    try {
      await boardsApi.removeBoardPermission(boardId, userId);
      await refreshPermissions();
      if (onChanged) onChanged();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Transition appear show as={Fragment}>
      <Dialog as="div" className="relative z-[1000]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white p-0 shadow-2xl transition-all">
                <div className="px-5 py-4 border-b border-slate-200">
                  <Dialog.Title className="text-lg font-semibold text-slate-800">Manage Access</Dialog.Title>
                </div>
                {error && <div className="mx-5 mt-4 mb-0 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
                <div className="max-h-[70vh] overflow-y-auto p-5 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Add user</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search by name or email"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      />
                      <select value={roleToAdd} onChange={(e) => setRoleToAdd(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm">
                        <option value="viewer">viewer</option>
                        <option value="reviewer">reviewer</option>
                        <option value="editor">editor</option>
                      </select>
                    </div>
                    {searchResults.length > 0 && (
                      <div className="mt-2 overflow-hidden rounded border border-slate-200">
                        {searchResults.map(u => (
                          <div key={u.id} className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-sm">
                            <div>{u.first_name} {u.last_name} <span className="text-slate-500">({u.email})</span></div>
                            <button onClick={() => handleAdd(u.id)} className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">Add</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current members</label>
                    <div className="overflow-hidden rounded border border-slate-200">
                      {loading ? (
                        <div className="p-3 text-center text-slate-500 text-sm">Loading...</div>
                      ) : permissions.length === 0 ? (
                        <div className="p-3 text-slate-500 text-sm">No members yet.</div>
                      ) : permissions.map(p => {
                        const name = `${p.first_name || ''} ${p.last_name || ''}`.trim();
                        const label = name || p.email || 'Unknown user';
                        return (
                          <div key={p.user_id} className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-sm">
                            <div>{label}{p.email && name ? <span className="text-slate-500"> ({p.email})</span> : null}</div>
                            <div className="flex gap-2">
                              <select value={p.role} onChange={(e) => handleRoleChange(p.user_id, e.target.value)} className="rounded border border-slate-300 px-2 py-1 text-sm">
                                <option value="viewer">viewer</option>
                                <option value="reviewer">reviewer</option>
                                <option value="editor">editor</option>
                                <option value="owner" disabled>owner</option>
                              </select>
                              <button onClick={() => handleRemove(p.user_id)} className="rounded border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50">Remove</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
                  <button onClick={onClose} className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">Close</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
