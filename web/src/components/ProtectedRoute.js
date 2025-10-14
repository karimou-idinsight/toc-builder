'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAuth = true, requireSuperAdmin = false }) {
  const { user, loading, isSuperAdmin } = useAuth();
  const router = useRouter();
  
  // Track if we've already initiated a redirect to prevent race conditions
  // This ref persists across re-renders but resets on route changes
  // Without this, the useEffect could fire multiple times during auth loading,
  // causing unwanted redirects (e.g., redirecting from /board/1 to /boards)
  const hasRedirected = useRef(false);
  const currentPath = useRef(router.asPath);
  
  // Add a small delay before checking auth to avoid race conditions
  // This gives React time to batch state updates from AuthContext
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    if (!loading) {
      // Small delay to ensure user state has settled
      const timeout = setTimeout(() => setIsReady(true), 50);
      return () => clearTimeout(timeout);
    } else {
      setIsReady(false);
    }
  }, [loading]);

  // Reset redirect flag when the path actually changes
  useEffect(() => {
    if (currentPath.current !== router.asPath) {
      hasRedirected.current = false;
      currentPath.current = router.asPath;
    }
  }, [router.asPath]);

  useEffect(() => {
    // Don't do anything while loading or not ready
    if (loading || !isReady) {
      return;
    }

    // Prevent multiple redirects within the same page load
    // If we've already initiated a redirect, don't do it again
    if (hasRedirected.current) {
      console.log('[ProtectedRoute] Skipping redirect - already redirected');
      return;
    }

    const userIsSuperAdmin = user?.role === 'super_admin';
    console.log('[ProtectedRoute] Auth check:', { 
      path: router.asPath, 
      user: user?.email, 
      requireAuth, 
      requireSuperAdmin,
      hasRedirected: hasRedirected.current,
      isReady
    });

    // If authentication is required but user is not authenticated
    if (requireAuth && !user) {
      console.log('[ProtectedRoute] Redirecting to login - no user');
      hasRedirected.current = true;
      // Store the current path to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', router.asPath);
      router.push('/login');
      return;
    }

    // If super admin access is required but user is not super admin
    if (requireSuperAdmin && !userIsSuperAdmin) {
      console.log('[ProtectedRoute] Redirecting to / - not super admin');
      hasRedirected.current = true;
      router.push('/');
      return;
    }

    // If user is authenticated but trying to access auth pages
    if (!requireAuth && user) {
      console.log('[ProtectedRoute] Redirecting authenticated user from auth page');
      hasRedirected.current = true;
      if (userIsSuperAdmin) {
        router.push('/admin');
      } else {
        router.push('/boards');
      }
      return;
    }

    console.log('[ProtectedRoute] No redirect needed - showing content');
      
  }, [user, loading, isReady, requireAuth, requireSuperAdmin, router]);

  // Show loading state (including the brief delay for state settling)
  if (loading || !isReady) {
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
          onClick={() => router.push('/boards')}
          style={styles.button}
        >
          Go to Boards
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
