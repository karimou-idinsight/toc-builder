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
  
  // Check if we have a token - if we do, we should wait for auth to complete
  // rather than immediately redirecting
  const [hasToken, setHasToken] = useState(false);
  
  useEffect(() => {
    // Check for token on mount
    const token = localStorage.getItem('accessToken');
    setHasToken(!!token);
  }, []);

  // Reset redirect flag when the path actually changes
  useEffect(() => {
    if (currentPath.current !== router.asPath) {
      hasRedirected.current = false;
      currentPath.current = router.asPath;
    }
  }, [router.asPath]);

  useEffect(() => {
    // Don't do anything while loading
    if (loading) {
      return;
    }
    
    // If we have a token but no user yet, wait for the auth check to complete
    // This prevents redirecting during the brief moment between token check and user load
    if (hasToken && !user && requireAuth) {
      console.log('[ProtectedRoute] Has token but no user yet - waiting for auth');
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
      hasToken,
      userExists: !!user
    });

    // If authentication is required but user is not authenticated AND no token exists
    if (requireAuth && !user && !hasToken) {
      console.log('[ProtectedRoute] Redirecting to login - no user and no token');
      hasRedirected.current = true;
      // Store the current path to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', router.asPath);
      router.push('/login');
      return;
    }
    
    // If we had a token but auth failed (user is still null after loading completes)
    if (requireAuth && !user && hasToken && !loading) {
      console.log('[ProtectedRoute] Redirecting to login - token invalid');
      hasRedirected.current = true;
      setHasToken(false); // Clear the token flag
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
      
  }, [user, loading, requireAuth, requireSuperAdmin, hasToken, router]);

  // Show loading state OR if we have a token but no user yet (auth in progress)
  if (loading || (hasToken && !user && requireAuth)) {
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
