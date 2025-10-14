'use client';

import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAuth = true, requireSuperAdmin = false }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  console.log({ user, loading, requireAuth, requireSuperAdmin });

  // Show loading screen while auth is being checked
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  // After loading completes, handle auth requirements
  const userIsSuperAdmin = user?.role === 'super_admin';

  // Redirect: authentication required but user is not authenticated
  if (requireAuth && !user) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', router.asPath);
      router.replace('/login');
    }
    return null;
  }

  // Redirect: super admin access required but user is not super admin
  if (requireSuperAdmin && user && !userIsSuperAdmin) {
    if (typeof window !== 'undefined') {
      console.log('Redirecting to boards');
      router.replace('/boards');
    }
    return null;
  }


  // All checks passed - render the protected content
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
