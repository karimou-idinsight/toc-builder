'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

/**
 * Central authentication router - handles ALL auth-based navigation for the entire app
 * This prevents conflicts from multiple components trying to redirect simultaneously
 */
export default function AuthRouter({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Reset on path change
    hasChecked.current = false;
  }, [router.asPath]);

  useEffect(() => {
    // Wait for auth to load
    if (loading) return;
    
    // Only check once per page
    if (hasChecked.current) return;
    hasChecked.current = true;

    const path = router.pathname;
    const userIsSuperAdmin = user?.role === 'super_admin';

    console.log('[AuthRouter] Checking path:', path, 'User:', user?.email);

    // Define route categories
    const publicRoutes = ['/'];
    const authRoutes = ['/login', '/register'];
    const adminRoutes = ['/admin'];
    
    const isPublicRoute = publicRoutes.includes(path);
    const isAuthRoute = authRoutes.includes(path);
    const isAdminRoute = adminRoutes.some(route => path.startsWith(route));

    // Rule 1: Redirect authenticated users away from auth pages (login/register)
    if (isAuthRoute && user) {
      const target = userIsSuperAdmin ? '/admin' : '/boards';
      console.log('[AuthRouter] Redirecting authenticated user to', target);
      router.replace(target);
      return;
    }

    // Rule 2: Redirect unauthenticated users to login (except public routes)
    if (!user && !isPublicRoute && !isAuthRoute) {
      console.log('[AuthRouter] Redirecting unauthenticated user to login');
      sessionStorage.setItem('redirectAfterLogin', router.asPath);
      router.replace('/login');
      return;
    }

    // Rule 3: Redirect non-admin users away from admin routes
    if (isAdminRoute && user && !userIsSuperAdmin) {
      console.log('[AuthRouter] Redirecting non-admin user to /boards');
      router.replace('/boards');
      return;
    }

    console.log('[AuthRouter] No redirect needed');
  }, [user, loading, router.pathname, router.asPath, router]);

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
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
  }
};

