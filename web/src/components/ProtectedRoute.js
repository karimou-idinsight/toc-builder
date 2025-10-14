'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAuth = true, requireSuperAdmin = false }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const redirecting = useRef(false);
  const lastPath = useRef('');

  // Reset redirecting flag when path changes
  useEffect(() => {
    if (lastPath.current !== router.asPath) {
      redirecting.current = false;
      lastPath.current = router.asPath;
    }
  }, [router.asPath]);

  useEffect(() => {
    // Only run redirect logic once loading is complete
    if (loading || redirecting.current) return;

    const userIsSuperAdmin = user?.role === 'super_admin';

    // If authentication is required but user is not authenticated
    if (requireAuth && !user) {
      redirecting.current = true;
      sessionStorage.setItem('redirectAfterLogin', router.asPath);
      router.replace('/login');
      return;
    }

    // If super admin access is required but user is not super admin
    if (requireSuperAdmin && user && !userIsSuperAdmin) {
      redirecting.current = true;
      router.replace('/boards');
      return;
    }

    // If user is authenticated but trying to access auth pages (login/register)
    if (!requireAuth && user) {
      redirecting.current = true;
      if (userIsSuperAdmin) {
        router.replace('/admin');
      } else {
        router.replace('/boards');
      }
      return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, requireAuth, requireSuperAdmin]);

  // Show loading screen while auth is being checked
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  // Show unauthorized if super admin required but user is not super admin
  if (requireSuperAdmin && user && user.role !== 'super_admin') {
    return (
      <div style={styles.errorContainer}>
        <h1 style={styles.errorTitle}>Unauthorized</h1>
        <p style={styles.errorText}>You do not have permission to access this page.</p>
        <button
          onClick={() => router.push('/boards')}
          style={styles.button}
        >
          Go to Boards
        </button>
      </div>
    );
  }

  // Don't render children if auth is required but user is not authenticated
  if (requireAuth && !user) {
    return null;
  }

  // Don't render auth pages if user is already authenticated
  if (!requireAuth && user) {
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
