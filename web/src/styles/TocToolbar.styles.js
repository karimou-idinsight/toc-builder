// Import design tokens
import { colors, spacing, typography, shadows, borderRadius } from './tokens';

export const tocToolbarStyles = {
  container: {
    backgroundColor: '#ffffff',
    borderBottom: `1px solid ${colors.gray[200]}`,
    padding: spacing.md,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },

  title: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: colors.gray[900],
    margin: 0,
  },

  actions: {
    display: 'flex',
    gap: spacing.sm,
  },

  button: {
    backgroundColor: colors.primary[500],
    color: '#ffffff',
    border: 'none',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    transition: 'all 0.2s ease',
  },

  buttonHover: {
    backgroundColor: colors.primary[600],
  },

  buttonSecondary: {
    backgroundColor: colors.gray[500],
  },

  buttonSecondaryHover: {
    backgroundColor: colors.gray[600],
  },

  buttonDanger: {
    backgroundColor: colors.error,
  },

  buttonDangerHover: {
    backgroundColor: '#dc2626',
  },
  
  section: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  separator: {
    width: '1px',
    height: '24px',
    backgroundColor: '#e5e7eb',
    margin: '0 12px'
  },
  
  statusText: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },
  
  counter: {
    fontSize: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontWeight: '600'
  }
};