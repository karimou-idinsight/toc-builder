// Import design tokens
import { colors, spacing, typography, shadows, borderRadius } from './tokens';

export const tocSectionStyles = {
  container: {
    marginBottom: spacing.md,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.xs} ${spacing.sm}`,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },

  headerHover: {
    backgroundColor: colors.gray[200],
  },

  headerCollapsed: {
    marginBottom: 0,
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },

  collapseIcon: {
    fontSize: '12px',
    color: colors.gray[500],
    transition: 'transform 0.2s ease',
  },

  collapseIconCollapsed: {
    transform: 'rotate(-90deg)',
  },

  title: {
    ...typography.sm,
    fontWeight: 600,
    color: colors.gray[700],
    margin: 0,
  },

  titleInput: {
    ...typography.sm,
    fontWeight: 600,
    color: colors.gray[700],
    border: 'none',
    backgroundColor: 'white',
    borderRadius: borderRadius.sm,
    padding: `2px ${spacing.xs}`,
    outline: 'none',
    flex: 1,
  },

  count: {
    ...typography.xs,
    color: colors.gray[500],
    marginLeft: spacing.xs,
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
  },

  actionButton: {
    background: 'none',
    border: 'none',
    padding: spacing.xs,
    cursor: 'pointer',
    color: colors.gray[500],
    fontSize: '14px',
    transition: 'color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionButtonHover: {
    color: colors.gray[700],
  },

  deleteButton: {
    color: colors.red[500],
  },

  deleteButtonHover: {
    color: colors.red[700],
  },

  content: {
    paddingLeft: spacing.md,
  },

  contentCollapsed: {
    display: 'none',
  },

  emptyState: {
    ...typography.sm,
    color: colors.gray[400],
    fontStyle: 'italic',
    padding: spacing.md,
    textAlign: 'center',
  },
};

