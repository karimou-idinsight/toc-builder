// Import design tokens
import { colors, spacing, typography, shadows, borderRadius } from './tokens';

export const tocBoardStyles = {
  container: {
    height: '100vh',
    backgroundColor: colors.gray[50],
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    display: 'flex',
    flexDirection: 'column',
  },
  
  content: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  
  boardInner: {
    position: 'relative', // Add relative positioning for edge container
    display: 'flex',
    gap: '50px',
    margin: spacing.md,
    minHeight: '100%',
    alignItems: 'flex-start',
    overflow: 'auto',
  },
  
  listsContainer: {
    display: 'flex',
    gap: '20px',
    padding: '20px',
    minHeight: '100vh',
    overflow: 'auto'
  },
  
  dragOverlay: {
    opacity: 0.8,
    transform: 'rotate(5deg)',
    zIndex: 1000
  }
};
