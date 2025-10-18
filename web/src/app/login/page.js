'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { loginPageStyles } from '../../styles/LoginPage.styles';

export default function LoginPage() {
  const { login, error: authError, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={loginPageStyles.container}>
      <div style={loginPageStyles.card}>
        <div style={loginPageStyles.header}>
          <h1 style={loginPageStyles.title}>TOC Builder</h1>
          <p style={loginPageStyles.subtitle}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={loginPageStyles.form}>
          {(error || authError) && (
            <div style={loginPageStyles.errorBanner}>
              {error || authError}
            </div>
          )}

          <div style={loginPageStyles.formGroup}>
            <label htmlFor="email" style={loginPageStyles.label}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              style={loginPageStyles.input}
              placeholder="you@example.com"
            />
          </div>

          <div style={loginPageStyles.formGroup}>
            <div style={loginPageStyles.labelRow}>
              <label htmlFor="password" style={loginPageStyles.label}>
                Password
              </label>
              <Link href="/forgot-password" style={loginPageStyles.link}>
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              style={loginPageStyles.input}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || loading}
            style={{
              ...loginPageStyles.button,
              ...(isLoading || loading ? loginPageStyles.buttonDisabled : {})
            }}
          >
            {isLoading || loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={loginPageStyles.footer}>
          <p style={loginPageStyles.footerText}>
            Don't have an account?{' '}
            <Link href="/register" style={loginPageStyles.link}>
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo credentials info */}
        <div style={loginPageStyles.demoInfo}>
          <p style={loginPageStyles.demoTitle}>Demo Credentials:</p>
          <p style={loginPageStyles.demoText}>Email: admin@tocbuilder.com</p>
          <p style={loginPageStyles.demoText}>Password: admin123</p>
        </div>
      </div>
    </div>
  );
}

// Styles moved to ../../styles/LoginPage.styles.js
