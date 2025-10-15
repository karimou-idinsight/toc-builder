export const styles = {
  // Dialog container styles
  dialog: {
    position: 'relative',
    zIndex: 1000
  },

  // Backdrop styles
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },

  // Full-screen container to center the dialog
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px'
  },

  // Dialog panel styles
  dialogPanel: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    minWidth: '480px',
    maxWidth: '640px',
    width: '100%',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column'
  },

  // Dialog title styles
  title: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px'
  },

  // Tabs container styles
  tabsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
    minHeight: 0
  },

  // Tab list styles
  tabList: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '8px'
  },

  // Tab button styles
  tabButton: {
    padding: '8px 12px',
    border: 'none',
    backgroundColor: 'transparent',
    fontWeight: 600,
    cursor: 'pointer'
  },

  // Tab button selected styles
  tabButtonSelected: {
    borderBottom: '2px solid #3b82f6',
    color: '#111827'
  },

  // Tab button unselected styles
  tabButtonUnselected: {
    borderBottom: '2px solid transparent',
    color: '#6b7280'
  },

  // Tab panels container styles
  tabPanelsContainer: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    paddingRight: '4px'
  },

  // Connection info styles
  connectionInfo: {
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    border: '1px solid #e5e7eb'
  },

  connectionInfoLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '8px'
  },

  connectionInfoContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px'
  },

  connectionNode: {
    flex: '1'
  },

  connectionNodeTitle: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: '2px'
  },

  connectionNodeList: {
    fontSize: '11px',
    color: '#6b7280'
  },

  connectionArrow: {
    color: '#9ca3af'
  },

  // Label input styles
  labelContainer: {
    marginBottom: '20px'
  },

  labelLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px'
  },

  labelInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },

  // Edge type selection styles
  edgeTypeContainer: {
    marginBottom: '8px'
  },

  edgeTypeLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '12px'
  },

  edgeTypeRadioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  // Radio button styles
  radioButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '6px',
    cursor: 'pointer'
  },

  radioButtonSelected: {
    border: '2px solid #3b82f6',
    backgroundColor: '#eff6ff'
  },

  radioButtonUnselected: {
    border: '2px solid #e5e7eb',
    backgroundColor: 'white'
  },

  radioContent: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  radioLeft: {
    display: 'flex',
    alignItems: 'center'
  },

  radioIndicator: {
    marginRight: '12px'
  },

  radioCircle: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  radioCircleSelected: {
    border: '2px solid #3b82f6',
    backgroundColor: '#3b82f6'
  },

  radioCircleUnselected: {
    border: '2px solid #d1d5db',
    backgroundColor: 'transparent'
  },

  radioDot: {
    width: '6px',
    height: '6px',
    backgroundColor: 'white',
    borderRadius: '50%'
  },

  radioLabel: {
    fontSize: '14px',
    fontWeight: '500'
  },

  // Comments section styles
  commentsContainer: {
    // Container for the entire comments section
  },

  commentsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#374151'
  },

  commentError: {
    marginBottom: '8px',
    color: '#ef4444',
    fontSize: '12px'
  },

  commentsLoading: {
    fontSize: '12px',
    color: '#6b7280'
  },

  commentsList: {
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '8px',
    backgroundColor: '#f9fafb'
  },

  noComments: {
    fontSize: '12px',
    color: '#6b7280'
  },

  // Individual comment styles
  commentItem: {
    padding: '8px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    marginBottom: '8px'
  },

  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px'
  },

  commentAuthor: {
    fontSize: '12px',
    color: '#374151',
    fontWeight: 600
  },

  commentDate: {
    fontSize: '11px',
    color: '#9ca3af'
  },

  commentContent: {
    fontSize: '13px',
    color: '#374151',
    whiteSpace: 'pre-wrap'
  },

  // Add comment form styles
  addCommentForm: {
    marginTop: '10px',
    display: 'flex',
    gap: '8px'
  },

  addCommentInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px'
  },

  addCommentButton: {
    padding: '8px 12px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px'
  },

  addCommentButtonEnabled: {
    backgroundColor: '#3b82f6',
    cursor: 'pointer'
  },

  addCommentButtonDisabled: {
    backgroundColor: '#93c5fd',
    cursor: 'not-allowed'
  },

  // Action buttons container styles
  actionButtonsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
    marginTop: '12px'
  },

  // Delete button styles
  deleteButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },

  deleteButtonHover: {
    backgroundColor: '#dc2626'
  },

  // Action buttons group styles
  actionButtonsGroup: {
    display: 'flex',
    gap: '12px'
  },

  // Cancel button styles
  cancelButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer'
  },

  // Save button styles
  saveButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};

// Helper functions for dynamic styles
export const getTabButtonStyle = (selected) => ({
  ...styles.tabButton,
  ...(selected ? styles.tabButtonSelected : styles.tabButtonUnselected)
});

export const getRadioButtonStyle = (selected) => ({
  ...styles.radioButton,
  ...(selected ? styles.radioButtonSelected : styles.radioButtonUnselected)
});

export const getRadioCircleStyle = (checked) => ({
  ...styles.radioCircle,
  ...(checked ? styles.radioCircleSelected : styles.radioCircleUnselected)
});

export const getAddCommentButtonStyle = (enabled) => ({
  ...styles.addCommentButton,
  ...(enabled ? styles.addCommentButtonEnabled : styles.addCommentButtonDisabled)
});
