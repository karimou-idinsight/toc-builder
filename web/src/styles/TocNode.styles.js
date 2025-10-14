// Import design tokens
import { colors, spacing, typography, shadows, borderRadius } from './tokens';

export const tocNodeStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    boxShadow: shadows.sm,
    border: '1px solid',
    borderColor: colors.gray[200],
    margin: spacing.xs,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    minHeight: '80px',
    padding: spacing.sm,
  },
  
  containerHover: {
    boxShadow: shadows.md,
    borderColor: colors.blue[300],
    transform: 'translateY(-1px)',
  },
  
  containerLinkMode: {
    borderColor: colors.purple[400],
    backgroundColor: colors.purple[50],
    cursor: 'crosshair',
  },
  
  containerLinkModeHover: {
    borderColor: colors.purple[500],
    backgroundColor: colors.purple[100],
    transform: 'scale(1.02)',
  },
  
  containerLinkSource: {
    borderColor: colors.green[500],
    backgroundColor: colors.green[50],
    boxShadow: `0 0 0 2px ${colors.green[200]}`,
  },
  
  containerConnected: {
    borderColor: colors.blue[400],
    backgroundColor: colors.blue[25],
  },
  
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  
  icon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.xs,
    color: colors.gray[600],
  },
  
  priority: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[500],
    backgroundColor: colors.gray[100],
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.sm,
    minWidth: '20px',
    textAlign: 'center',
  },
  
  actions: {
    display: 'flex',
    gap: spacing.xs,
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  
  actionButton: {
    backgroundColor: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    color: colors.gray[500],
    fontSize: typography.fontSize.sm,
    opacity: 0,
    transition: 'all 0.2s ease',
  },
  
  actionButtonVisible: {
    opacity: 1,
  },
  
  actionButtonHover: {
    backgroundColor: colors.gray[100],
    color: colors.gray[700],
  },
  
  content: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed,
  },
  
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  
  input: {
    border: `1px solid ${colors.gray[300]}`,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: typography.fontSize.sm,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  
  inputFocus: {
    borderColor: colors.blue[500],
    boxShadow: `0 0 0 2px ${colors.blue[100]}`,
  },
  
  title: {
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  
  description: {
    color: colors.gray[600],
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.normal,
  },
  
  buttonGroup: {
    display: 'flex',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  
  button: {
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.sm,
    border: 'none',
    cursor: 'pointer',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    transition: 'all 0.2s ease',
  },
  
  buttonPrimary: {
    backgroundColor: colors.blue[600],
    color: colors.white,
  },
  
  buttonPrimaryHover: {
    backgroundColor: colors.blue[700],
  },
  
  buttonSecondary: {
    backgroundColor: colors.gray[200],
    color: colors.gray[700],
  },
  
  buttonSecondaryHover: {
    backgroundColor: colors.gray[300],
  },
  
  // Additional styles for node details and metadata
  details: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.sm,
    fontSize: typography.fontSize.xs,
  },
  
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  
  metaItem: {
    color: colors.gray[600],
    fontSize: typography.fontSize.xs,
  },
  
  // Edit form specific styles
  editActions: {
    display: 'flex',
    gap: spacing.xs,
    marginTop: spacing.sm,
    justifyContent: 'flex-end',
  },
  
  // Context menu styles
  contextMenu: {
    position: 'fixed',
    backgroundColor: colors.white,
    border: `1px solid ${colors.gray[200]}`,
    borderRadius: borderRadius.md,
    boxShadow: shadows.lg,
    padding: spacing.xs,
    zIndex: 1000,
    minWidth: '150px',
  },
  
  contextMenuItem: {
    display: 'block',
    width: '100%',
    padding: spacing.sm,
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    borderRadius: borderRadius.sm,
    transition: 'background-color 0.2s ease',
  },
  
  contextMenuItemHover: {
    backgroundColor: colors.gray[100],
  },
  
  contextMenuItemDanger: {
    color: colors.red[600],
  },
  
  contextMenuItemDangerHover: {
    backgroundColor: colors.red[50],
    color: colors.red[700],
  },
  
  // Draggable indicator
  draggableIndicator: {
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    border: `2px dashed ${colors.blue[400]}`,
    borderRadius: borderRadius.md,
    pointerEvents: 'none',
  },
};