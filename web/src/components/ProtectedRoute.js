'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, requireAuth = true, requireSuperAdmin = false }) {
  const { user, loading, isSuperAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If authentication is required but user is not authenticated
      if (requireAuth && !user) {
        router.push('/login');
        return;
      }

      // If super admin access is required but user is not super admin
      if (requireSuperAdmin && !isSuperAdmin()) {
        router.push('/');
        return;
      }

      // If user is authenticated but trying to access auth pages
      if (!requireAuth && user) {
        if (isSuperAdmin()) {
          router.push('/admin');
        } else {
          router.push('/');
        }
        return;
      }
    }
  }, [user, loading, requireAuth, requireSuperAdmin, router, isSuperAdmin]);

  // Show loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  // Show unauthorized if super admin required but user is not super admin
  if (requireSuperAdmin && user && !isSuperAdmin()) {
    return (
      <div style={styles.errorContainer}>
        <h1 style={styles.errorTitle}>Unauthorized</h1>
        <p style={styles.errorText}>You do not have permission to access this page.</p>
        <button
          onClick={() => router.push('/')}
          style={styles.button}
        >
          Go to Home
        </button>
      </div>
    );
  }

  // Don't render children until auth check is complete
  if (requireAuth && !user) {
    return null;
  }

  return <>{children}</>;
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '1rem',
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '2rem'
  },
  errorTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '0.5rem'
  },
  errorText: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '2rem'
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  }
};
