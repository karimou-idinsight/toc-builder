'use client';

import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { boardsApi } from '../../utils/boardsApi';
import { boardsPageStyles } from '../../styles/BoardsPage.styles';

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
        return boardsPageStyles.badgeOwner;
      case 'contributor':
        return boardsPageStyles.badgeContributor;
      case 'reviewer':
        return boardsPageStyles.badgeReviewer;
      default:
        return boardsPageStyles.badgeViewer;
    }
  };

  return (
    <div style={boardsPageStyles.container}>
      {/* Header */}
      <header style={boardsPageStyles.header}>
        <div style={boardsPageStyles.headerContent}>
          <div>
            <h1 style={boardsPageStyles.title}>My Boards</h1>
            <p style={boardsPageStyles.subtitle}>
              Welcome back, {user?.first_name} {user?.last_name}
            </p>
          </div>
          <div style={boardsPageStyles.headerActions}>
            <button
              onClick={() => setShowCreateModal(true)}
              style={boardsPageStyles.primaryButton}
            >
              + New Board
            </button>
            {user?.role === 'super_admin' && (
              <button
                onClick={() => router.push('/admin')}
                style={boardsPageStyles.secondaryButton}
              >
                Admin Dashboard
              </button>
            )}
            <button onClick={logout} style={boardsPageStyles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={boardsPageStyles.main}>
        {error && (
          <div style={boardsPageStyles.errorBanner}>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div style={boardsPageStyles.loadingContainer}>
            <div style={boardsPageStyles.spinner}></div>
            <p style={boardsPageStyles.loadingText}>Loading boards...</p>
          </div>
        ) : boards.length === 0 ? (
          <div style={boardsPageStyles.emptyState}>
            <div style={boardsPageStyles.emptyIcon}>📊</div>
            <h2 style={boardsPageStyles.emptyTitle}>No boards yet</h2>
            <p style={boardsPageStyles.emptyText}>
              Create your first Theory of Change board to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={boardsPageStyles.createButton}
            >
              + Create Your First Board
            </button>
          </div>
        ) : (
          <div style={boardsPageStyles.boardsGrid}>
            {boards.map((board) => (
              <div key={board.id} style={boardsPageStyles.boardCard}>
                <div style={boardsPageStyles.boardCardHeader}>
                  <div>
                    <h3 style={boardsPageStyles.boardTitle}>{board.name}</h3>
                    {board.description && (
                      <p style={boardsPageStyles.boardDescription}>{board.description}</p>
                    )}
                  </div>
                  <span style={{ ...boardsPageStyles.roleBadge, ...getRoleBadgeColor(board.role) }}>
                    {board.role}
                  </span>
                </div>

                <div style={boardsPageStyles.boardMeta}>
                  <div style={boardsPageStyles.metaItem}>
                    <span style={boardsPageStyles.metaIcon}>👥</span>
                    <span style={boardsPageStyles.metaText}>
                      {board.collaborator_count || 1} {board.collaborator_count === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  <div style={boardsPageStyles.metaItem}>
                    <span style={boardsPageStyles.metaIcon}>
                      {board.is_public ? '🌐' : '🔒'}
                    </span>
                    <span style={boardsPageStyles.metaText}>
                      {board.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <div style={boardsPageStyles.metaItem}>
                    <span style={boardsPageStyles.metaIcon}>📅</span>
                    <span style={boardsPageStyles.metaText}>
                      {new Date(board.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div style={boardsPageStyles.boardActions}>
                  <button
                    onClick={() => router.push(`/board/${board.id}`)}
                    style={boardsPageStyles.openButton}
                  >
                    Open Board
                  </button>
                {board.role === 'owner' && (
                  <button
                    onClick={() => setManageBoardId(board.id)}
                    style={boardsPageStyles.secondaryButton}
                    title="Manage access"
                  >
                    Manage Access
                  </button>
                )}
                  {board.role === 'owner' && (
                    <button
                      onClick={() => handleDeleteBoard(board.id, board.name)}
                      style={boardsPageStyles.deleteButton}
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

// Styles moved to ../../styles/BoardsPage.styles.js

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
