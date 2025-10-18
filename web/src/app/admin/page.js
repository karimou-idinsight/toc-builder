'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../utils/adminApi';
import { adminPageStyles } from '../../styles/AdminPage.styles';

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
      <div style={adminPageStyles.loadingContainer}>
        <div style={adminPageStyles.spinner}></div>
        <p style={adminPageStyles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={adminPageStyles.container}>
      {/* Header */}
      <header style={adminPageStyles.header}>
        <div style={adminPageStyles.headerContent}>
          <div>
            <h1 style={adminPageStyles.title}>Admin Dashboard</h1>
            <p style={adminPageStyles.subtitle}>
              Welcome back, {user?.first_name} {user?.last_name}
            </p>
          </div>
          <div style={adminPageStyles.headerActions}>
            <button
              onClick={() => router.push('/boards')}
              style={adminPageStyles.secondaryButton}
            >
              My Boards
            </button>
            <button onClick={handleLogout} style={adminPageStyles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={adminPageStyles.main}>
        {error && (
          <div style={adminPageStyles.errorBanner}>
            <p>{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div style={adminPageStyles.statsGrid}>
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
        <div style={adminPageStyles.section}>
          <h2 style={adminPageStyles.sectionTitle}>Quick Actions</h2>
          <div style={adminPageStyles.actionGrid}>
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
        <div style={adminPageStyles.section}>
          <h2 style={adminPageStyles.sectionTitle}>Recent Activity</h2>
          <div style={adminPageStyles.activityCard}>
            <p style={adminPageStyles.emptyState}>No recent activity to display</p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
  return (
    <div style={adminPageStyles.statCard}>
      <div style={adminPageStyles.statIcon} className="stat-icon">
        {icon}
      </div>
      <div style={adminPageStyles.statContent}>
        <p style={adminPageStyles.statTitle}>{title}</p>
        <p style={{ ...adminPageStyles.statValue, color }}>{value}</p>
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
        ...adminPageStyles.actionCard,
        ...(disabled && adminPageStyles.actionCardDisabled)
      }}
    >
      <div style={adminPageStyles.actionIcon}>{icon}</div>
      <div style={adminPageStyles.actionContent}>
        <h3 style={adminPageStyles.actionTitle}>{title}</h3>
        <p style={adminPageStyles.actionDescription}>{description}</p>
      </div>
    </button>
  );
}

// Styles moved to ../../styles/AdminPage.styles.js
