// Import design tokens
import { colors, spacing, typography, shadows, borderRadius } from './tokens';

export const tocListContentStyles = {
  container: {
    // List content styles
    flex: 1,
    padding: spacing.md,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  
  nodesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  
  footer: {
    // List footer styles
    padding: spacing.md,
    borderTop: `1px solid ${colors.gray[200]}`,
  },
  
  addNodeForm: {
    // Add node form styles
    backgroundColor: '#ffffff',
    border: `1px solid ${colors.gray[200]}`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  
  addNodeInput: {
    // Node input styles
    width: '100%',
    padding: spacing.sm,
    border: `1px solid ${colors.gray[300]}`,
    borderRadius: borderRadius.sm,
    fontSize: typography.fontSize.sm,
    backgroundColor: '#ffffff',
  },
  
  addNodeActions: {
    // Add node actions styles
    display: 'flex',
    gap: spacing.sm,
  },
  
  addButton: {
    // Toolbar button styles
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
  
  addButtonHover: {
    backgroundColor: colors.primary[600],
  },
  
  cancelButton: {
    // Toolbar secondary button styles
    backgroundColor: colors.gray[500],
    color: '#ffffff',
    border: 'none',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    transition: 'all 0.2s ease',
  },
  
  cancelButtonHover: {
    backgroundColor: colors.gray[600],
  },
  
  addNodeButton: {
    // Add node button styles
    width: '100%',
    backgroundColor: colors.gray[50],
    border: `2px dashed ${colors.gray[300]}`,
    color: colors.gray[500],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: typography.fontWeight.medium,
  },
  
  addNodeButtonHover: {
    backgroundColor: colors.gray[100],
    color: colors.gray[700],
  }
};