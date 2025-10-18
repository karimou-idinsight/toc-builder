'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { homePageStyles } from '../styles/HomePage.styles';

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
    <div style={homePageStyles.container}>
      <div style={homePageStyles.content}>
        {/* Hero Section */}
        <div style={homePageStyles.hero}>
          <h1 style={homePageStyles.title}>Theory of Change Builder</h1>
          <p style={homePageStyles.subtitle}>
            Create, visualize, and manage your Theory of Change with an intuitive drag-and-drop interface
          </p>
          
          <div style={homePageStyles.ctaButtons}>
            <Link href="/login" style={homePageStyles.primaryButton}>
              Sign In
            </Link>
            <Link href="/register" style={homePageStyles.secondaryButton}>
              Get Started
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div style={homePageStyles.features}>
          <div style={homePageStyles.featureCard}>
            <div style={homePageStyles.featureIcon}>📊</div>
            <h3 style={homePageStyles.featureTitle}>Visual Mapping</h3>
            <p style={homePageStyles.featureDescription}>
              Create clear visual representations of your activities, outputs, outcomes, and impact
            </p>
          </div>

          <div style={homePageStyles.featureCard}>
            <div style={homePageStyles.featureIcon}>🔗</div>
            <h3 style={homePageStyles.featureTitle}>Causal Pathways</h3>
            <p style={homePageStyles.featureDescription}>
              Map relationships between components and trace causal paths through your theory
            </p>
          </div>

          <div style={homePageStyles.featureCard}>
            <div style={homePageStyles.featureIcon}>🏷️</div>
            <h3 style={homePageStyles.featureTitle}>Organize with Tags</h3>
            <p style={homePageStyles.featureDescription}>
              Tag and filter your activities by themes, pillars, or any custom categorization
            </p>
          </div>

          <div style={homePageStyles.featureCard}>
            <div style={homePageStyles.featureIcon}>👥</div>
            <h3 style={homePageStyles.featureTitle}>Collaborate</h3>
            <p style={homePageStyles.featureDescription}>
              Share boards with your team and manage permissions for collaborative planning
            </p>
          </div>

          <div style={homePageStyles.featureCard}>
            <div style={homePageStyles.featureIcon}>✏️</div>
            <h3 style={homePageStyles.featureTitle}>Drag & Drop</h3>
            <p style={homePageStyles.featureDescription}>
              Intuitive interface with drag-and-drop functionality for easy board management
            </p>
          </div>

          <div style={homePageStyles.featureCard}>
            <div style={homePageStyles.featureIcon}>💾</div>
            <h3 style={homePageStyles.featureTitle}>Auto-Save</h3>
            <p style={homePageStyles.featureDescription}>
              Your work is automatically saved, so you never lose your progress
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer style={homePageStyles.footer}>
          <p style={homePageStyles.footerText}>
            &copy; {new Date().getFullYear()} Theory of Change Builder. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

// Styles moved to ../styles/HomePage.styles.js
