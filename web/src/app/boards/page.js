'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { boardsApi } from '../../utils/boardsApi';
import { boardsPageStyles } from '../../styles/BoardsPage.styles';
import CreateBoardModal from '../../components/CreateBoardModal';
import ManageAccessModal from '../../components/ManageAccessModal';
import ProtectedRoute from '../../components/ProtectedRoute';

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
      await loadBoards();
    } catch (err) {
      alert(err.message);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'owner':
        return boardsPageStyles.badgeOwner;
      case 'editor':
        return boardsPageStyles.badgeEditor;
      case 'reviewer':
        return boardsPageStyles.badgeReviewer;
      case 'viewer':
        return boardsPageStyles.badgeViewer;
      default:
        return boardsPageStyles.badgeViewer;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={boardsPageStyles.container}>
        <div style={boardsPageStyles.loadingContainer}>
          <div style={boardsPageStyles.spinner}></div>
          <p style={boardsPageStyles.loadingText}>Loading your boards...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={boardsPageStyles.container}>
      {/* Header */}
      <header style={boardsPageStyles.header}>
        <div style={boardsPageStyles.headerContent}>
          <div>
            <h1 style={boardsPageStyles.title}>My Boards</h1>
            <p style={boardsPageStyles.subtitle}>
              Manage your Theory of Change boards
            </p>
          </div>
          <div style={boardsPageStyles.headerActions}>
            <button
              onClick={() => setShowCreateModal(true)}
              style={boardsPageStyles.primaryButton}
            >
              Create Board
            </button>
            <Link href="/admin" style={boardsPageStyles.secondaryButton}>
              Admin
            </Link>
            <button
              onClick={logout}
              style={boardsPageStyles.logoutButton}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={boardsPageStyles.main}>
        {error && (
          <div style={boardsPageStyles.errorBanner}>
            {error}
          </div>
        )}

        {boards.length === 0 ? (
          <div style={boardsPageStyles.emptyState}>
            <div style={boardsPageStyles.emptyIcon}>📋</div>
            <h2 style={boardsPageStyles.emptyTitle}>No boards yet</h2>
            <p style={boardsPageStyles.emptyText}>
              Create your first Theory of Change board to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={boardsPageStyles.createButton}
            >
              Create Your First Board
            </button>
          </div>
        ) : (
          <div style={boardsPageStyles.boardsGrid}>
            {boards.map((board) => (
              <div key={board.id} style={boardsPageStyles.boardCard}>
                <div style={boardsPageStyles.boardCardHeader}>
                  <div>
                    <h3 style={boardsPageStyles.boardTitle}>{board.name}</h3>
                    <p style={boardsPageStyles.boardDescription}>
                      {board.description || 'No description provided'}
                    </p>
                  </div>
                  <div style={boardsPageStyles.roleBadge}>
                    <span style={getRoleBadgeStyle(board.role)}>
                      {board.role}
                    </span>
                  </div>
                </div>

                <div style={boardsPageStyles.boardMeta}>
                  <div style={boardsPageStyles.metaItem}>
                    <span style={boardsPageStyles.metaIcon}>📅</span>
                    <span style={boardsPageStyles.metaText}>
                      Created {formatDate(board.created_at)}
                    </span>
                  </div>
                  {board.updated_at && (
                    <div style={boardsPageStyles.metaItem}>
                      <span style={boardsPageStyles.metaIcon}>🔄</span>
                      <span style={boardsPageStyles.metaText}>
                        Updated {formatDate(board.updated_at)}
                      </span>
                    </div>
                  )}
                </div>

                <div style={boardsPageStyles.boardActions}>
                  <Link
                    href={`/board/${board.id}`}
                    style={boardsPageStyles.openButton}
                  >
                    Open Board
                  </Link>
                  {board.role === 'owner' && (
                    <button
                      onClick={() => setManageBoardId(board.id)}
                      style={boardsPageStyles.deleteButton}
                      title="Manage Access"
                    >
                      👥 Manage Access
                    </button>
                  )}
                  {board.role === 'owner' && (
                    <button
                      onClick={() => handleDeleteBoard(board.id, board.name)}
                      style={boardsPageStyles.deleteButton}
                      title="Delete Board"
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
