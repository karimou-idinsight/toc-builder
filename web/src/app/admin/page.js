'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../utils/adminApi';

export default function AdminDashboard() {
  return (
    <ProtectedRoute requireSuperAdmin={true}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>Admin Dashboard</h1>
            <p style={styles.subtitle}>
              Welcome back, {user?.first_name} {user?.last_name}
            </p>
          </div>
          <div style={styles.headerActions}>
            <button
              onClick={() => router.push('/boards')}
              style={styles.secondaryButton}
            >
              My Boards
            </button>
            <button onClick={handleLogout} style={styles.logoutButton}>
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

        {/* Statistics Cards */}
        {stats && (
          <div style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={stats.users.total_users}
              icon="👥"
              color="#3b82f6"
            />
            <StatCard
              title="Active Users"
              value={stats.users.active_users}
              icon="✅"
              color="#10b981"
            />
            <StatCard
              title="Super Admins"
              value={stats.users.super_admins}
              icon="⭐"
              color="#f59e0b"
            />
            <StatCard
              title="Verified Users"
              value={stats.users.verified_users}
              icon="📧"
              color="#8b5cf6"
            />
            <StatCard
              title="Total Boards"
              value={stats.boards.total_boards}
              icon="📊"
              color="#ec4899"
            />
            <StatCard
              title="Public Boards"
              value={stats.boards.public_boards}
              icon="🌐"
              color="#06b6d4"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actionGrid}>
            <ActionCard
              title="Manage Users"
              description="View, create, edit, and manage user accounts"
              icon="👥"
              onClick={() => router.push('/admin/users')}
            />
            <ActionCard
              title="System Settings"
              description="Configure system-wide settings and preferences"
              icon="⚙️"
              onClick={() => alert('Coming soon!')}
              disabled
            />
            <ActionCard
              title="View Boards"
              description="Browse and manage all boards in the system"
              icon="📊"
              onClick={() => alert('Coming soon!')}
              disabled
            />
            <ActionCard
              title="Activity Log"
              description="View system activity and audit logs"
              icon="📝"
              onClick={() => alert('Coming soon!')}
              disabled
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recent Activity</h2>
          <div style={styles.activityCard}>
            <p style={styles.emptyState}>No recent activity to display</p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon} className="stat-icon">
        {icon}
      </div>
      <div style={styles.statContent}>
        <p style={styles.statTitle}>{title}</p>
        <p style={{ ...styles.statValue, color }}>{value}</p>
      </div>
    </div>
  );
}

// Action Card Component
function ActionCard({ title, description, icon, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.actionCard,
        ...(disabled && styles.actionCardDisabled)
      }}
    >
      <div style={styles.actionIcon}>{icon}</div>
      <div style={styles.actionContent}>
        <h3 style={styles.actionTitle}>{title}</h3>
        <p style={styles.actionDescription}>{description}</p>
      </div>
    </button>
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
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  statIcon: {
    fontSize: '2.5rem',
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: 0,
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0.25rem 0 0',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '1rem',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    gap: '1rem',
    width: '100%',
  },
  actionCardDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  actionIcon: {
    fontSize: '2rem',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 0.5rem',
  },
  actionDescription: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: 0,
    lineHeight: '1.5',
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  emptyState: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '0.875rem',
    margin: 0,
  },
};
