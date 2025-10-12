// Import design tokens
import { colors, spacing, typography, shadows, borderRadius } from './tokens';

export const tocListHeaderStyles = {
  container: {
    position: 'relative'
  },
  
  draggableArea: {
    // Base draggable header styles
    padding: spacing.md,
    borderBottom: `1px solid ${colors.gray[200]}`,
    cursor: 'grab',
  },
  
  draggableAreaActive: {
    cursor: 'grabbing',
  },
  
  titleForm: {
    flex: 1
  },
  
  titleInput: {
    // Node input styles
    width: '100%',
    margin: 0,
    padding: spacing.sm,
    border: `1px solid ${colors.gray[300]}`,
    borderRadius: borderRadius.sm,
    fontSize: typography.fontSize.sm,
    backgroundColor: '#ffffff',
  },
  
  title: {
    // List title styles
    paddingLeft: '8px',
    cursor: 'pointer',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    margin: 0,
  },
  
  buttonsContainer: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    zIndex: 10,
    pointerEvents: 'auto'
  },
  
  nodeCount: {
    fontSize: '0.75rem',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  
  settingsButton: {
    // Menu button styles
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.gray[400],
    cursor: 'pointer',
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    transition: 'all 0.2s ease',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  settingsButtonHover: {
    backgroundColor: colors.gray[100],
    color: colors.gray[700],
  },
  
  collapseButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#6b7280',
    padding: '4px',
  },
  
  deleteButton: {
    // Delete button styles
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.gray[400],
    cursor: 'pointer',
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    transition: 'all 0.2s ease',
  },
  
  deleteButtonHover: {
    backgroundColor: colors.gray[100],
    color: colors.gray[700],
  },
  
  deleteButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  }
};