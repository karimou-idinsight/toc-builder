'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { registerPageStyles } from '../../styles/RegisterPage.styles';

export default function RegisterPage() {
  const { register, error: authError, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);

    if (!result.success) {
      setError(result.error || 'Registration failed');
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
    <div style={registerPageStyles.container}>
      <div style={registerPageStyles.card}>
        <div style={registerPageStyles.header}>
          <h1 style={registerPageStyles.title}>TOC Builder</h1>
          <p style={registerPageStyles.subtitle}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} style={registerPageStyles.form}>
          {(error || authError) && (
            <div style={registerPageStyles.errorBanner}>
              {error || authError}
            </div>
          )}

          <div style={registerPageStyles.formRow}>
            <div style={registerPageStyles.formGroup}>
              <label htmlFor="first_name" style={registerPageStyles.label}>
                First name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                style={registerPageStyles.input}
                placeholder="John"
              />
            </div>

            <div style={registerPageStyles.formGroup}>
              <label htmlFor="last_name" style={registerPageStyles.label}>
                Last name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
                style={registerPageStyles.input}
                placeholder="Doe"
              />
            </div>
          </div>

          <div style={registerPageStyles.formGroup}>
            <label htmlFor="email" style={registerPageStyles.label}>
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
              style={registerPageStyles.input}
              placeholder="you@example.com"
            />
          </div>

          <div style={registerPageStyles.formGroup}>
            <label htmlFor="password" style={registerPageStyles.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              style={registerPageStyles.input}
              placeholder="••••••••"
            />
            <p style={registerPageStyles.hint}>Must be at least 8 characters</p>
          </div>

          <div style={registerPageStyles.formGroup}>
            <label htmlFor="confirmPassword" style={registerPageStyles.label}>
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={registerPageStyles.input}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            // disabled={isLoading || loading}
            disabled={true}
            style={{
              ...registerPageStyles.button,
              ...(isLoading || loading ? registerPageStyles.buttonDisabled : {})
            }}
          >
            {isLoading || loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div style={registerPageStyles.footer}>
          <p style={registerPageStyles.footerText}>
            Already have an account?{' '}
            <Link href="/login" style={registerPageStyles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Styles moved to ../../styles/RegisterPage.styles.js
