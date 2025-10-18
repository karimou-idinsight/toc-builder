'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Hero Section */}
        <div style={styles.hero}>
          <h1 style={styles.title}>Theory of Change Builder</h1>
          <p style={styles.subtitle}>
            Create, visualize, and manage your Theory of Change with an intuitive drag-and-drop interface
          </p>
          
          <div style={styles.ctaButtons}>
            <Link href="/login" style={styles.primaryButton}>
              Sign In
            </Link>
            <Link href="/register" style={styles.secondaryButton}>
              Get Started
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div style={styles.features}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📊</div>
            <h3 style={styles.featureTitle}>Visual Mapping</h3>
            <p style={styles.featureDescription}>
              Create clear visual representations of your activities, outputs, outcomes, and impact
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🔗</div>
            <h3 style={styles.featureTitle}>Causal Pathways</h3>
            <p style={styles.featureDescription}>
              Map relationships between components and trace causal paths through your theory
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🏷️</div>
            <h3 style={styles.featureTitle}>Organize with Tags</h3>
            <p style={styles.featureDescription}>
              Tag and filter your activities by themes, pillars, or any custom categorization
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>👥</div>
            <h3 style={styles.featureTitle}>Collaborate</h3>
            <p style={styles.featureDescription}>
              Share boards with your team and manage permissions for collaborative planning
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>✏️</div>
            <h3 style={styles.featureTitle}>Drag & Drop</h3>
            <p style={styles.featureDescription}>
              Intuitive interface with drag-and-drop functionality for easy board management
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>💾</div>
            <h3 style={styles.featureTitle}>Auto-Save</h3>
            <p style={styles.featureDescription}>
              Your work is automatically saved, so you never lose your progress
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>
            &copy; {new Date().getFullYear()} Theory of Change Builder. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '2rem 1rem',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  hero: {
    textAlign: 'center',
    padding: '4rem 0 6rem',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '1.5rem',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#64748b',
    marginBottom: '3rem',
    maxWidth: '700px',
    margin: '0 auto 3rem',
    lineHeight: '1.6',
  },
  ctaButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '1rem 2.5rem',
    borderRadius: '0.5rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.2s',
    display: 'inline-block',
    border: '2px solid #3b82f6',
    cursor: 'pointer',
  },
  secondaryButton: {
    backgroundColor: 'white',
    color: '#3b82f6',
    padding: '1rem 2.5rem',
    borderRadius: '0.5rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.2s',
    display: 'inline-block',
    border: '2px solid #3b82f6',
    cursor: 'pointer',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    padding: '3rem 0',
  },
  featureCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.75rem',
  },
  featureDescription: {
    fontSize: '1rem',
    color: '#64748b',
    lineHeight: '1.6',
  },
  footer: {
    marginTop: '6rem',
    paddingTop: '2rem',
    borderTop: '1px solid #e2e8f0',
    textAlign: 'center',
  },
  footerText: {
    color: '#94a3b8',
    fontSize: '0.875rem',
  },
};
