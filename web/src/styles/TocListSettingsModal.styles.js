// Import design tokens
import { colors, spacing, typography, shadows, borderRadius } from './tokens';

export const tocListSettingsModalStyles = {
  overlay: {
    // Modal overlay styles
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  container: {
    position: 'fixed',
    inset: 0,
    zIndex: 10,
    overflow: 'auto'
  },
  
  wrapper: {
    display: 'flex',
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  },
  
  modal: {
    // Modal styles
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.lg,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    padding: spacing.lg,
    minWidth: '320px',
    maxWidth: '400px',
    position: 'relative',
  },
  
  header: {
    // Modal header styles
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottom: `1px solid ${colors.gray[200]}`,
  },
  
  title: {
    // Modal title styles
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    margin: 0,
  },
  
  closeButton: {
    // Close button styles
    background: 'none',
    border: 'none',
    color: colors.gray[400],
    cursor: 'pointer',
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    transition: 'all 0.2s ease',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  closeButtonHover: {
    backgroundColor: colors.gray[100],
    color: colors.gray[700],
  },
  
  content: {
    // Modal content styles
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  
  colorPickerSection: {
    // Color picker section styles
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  
  colorPickerLabel: {
    // Color picker label styles
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    fontWeight: typography.fontWeight.medium,
  },
  
  colorPicker: {
    // Color picker grid styles
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
  },
  
  colorOption: {
    // Color option styles
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  
  colorOptionActive: {
    border: '3px solid #ffffff',
    boxShadow: '0 0 0 3px #3b82f6',
    transform: 'scale(1.1)',
  },
  
  colorOptionHover: {
    transform: 'scale(1.05)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },

  // New styles for form elements
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },

  label: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    fontWeight: typography.fontWeight.medium,
  },

  textInput: {
    padding: spacing.sm,
    border: `1px solid ${colors.gray[300]}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },

  select: {
    padding: spacing.sm,
    border: `1px solid ${colors.gray[300]}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    outline: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
  },

  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },

  actions: {
    display: 'flex',
    gap: spacing.sm,
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },

  saveButton: {
    padding: `${spacing.sm} ${spacing.md}`,
    backgroundColor: colors.blue[600],
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  saveButtonHover: {
    backgroundColor: colors.blue[700],
  },

  deleteButton: {
    padding: `${spacing.sm} ${spacing.md}`,
    backgroundColor: colors.red[600],
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  deleteButtonHover: {
    backgroundColor: colors.red[700],
  },

  cancelButton: {
    padding: `${spacing.sm} ${spacing.md}`,
    backgroundColor: colors.gray[200],
    color: colors.gray[700],
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  cancelButtonHover: {
    backgroundColor: colors.gray[300],
  }
};