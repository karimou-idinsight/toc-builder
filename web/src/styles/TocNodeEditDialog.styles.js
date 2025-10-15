export const styles = {
  // Dialog overlay styles
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },

  // Dialog panel styles
  dialog: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },

  // Dialog title styles
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#1f2937'
  },

  // Section styles
  section: {
    marginBottom: '1.5rem'
  },

  // Label styles
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.5rem',
    color: '#374151'
  },

  // Input styles
  input: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },

  inputFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  },

  // Textarea styles
  textarea: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    resize: 'vertical',
    minHeight: '80px',
    boxSizing: 'border-box'
  },

  // Multi-select container styles
  multiSelectContainer: {
    position: 'relative',
    width: '100%'
  },

  // Selected items styles
  selectedItems: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  },

  selectedItem: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },

  removeButton: {
    background: 'none',
    border: 'none',
    color: '#1d4ed8',
    cursor: 'pointer',
    fontSize: '0.875rem',
    padding: '0',
    lineHeight: '1'
  },

  // Dropdown styles
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '0.25rem',
    maxHeight: '200px',
    overflow: 'auto',
    zIndex: 10,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },

  dropdownItem: {
    padding: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    borderBottom: '1px solid #f3f4f6'
  },

  dropdownItemHover: {
    backgroundColor: '#f3f4f6'
  },

  // Tag container styles
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  },

  tag: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },

  // Tag input styles
  tagInput: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },

  // Add button styles
  addButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s'
  },

  addButtonDisabled: {
    backgroundColor: '#d1d5db',
    color: '#9ca3af',
    cursor: 'not-allowed'
  },

  // Actions container styles
  actions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    marginTop: '2rem'
  },

  // Button base styles
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s'
  },

  // Cancel button styles
  cancelButton: {
    backgroundColor: '#f3f4f6',
    color: '#374151'
  },

  // Save button styles
  saveButton: {
    backgroundColor: '#3b82f6',
    color: 'white'
  },

  saveButtonDisabled: {
    backgroundColor: '#d1d5db',
    color: '#9ca3af',
    cursor: 'not-allowed'
  }
};

// Helper functions for dynamic styles
export const getInputStyle = (focused) => ({
  ...styles.input,
  ...(focused ? styles.inputFocus : {})
});

export const getAddButtonStyle = (enabled) => ({
  ...styles.addButton,
  ...(enabled ? {} : styles.addButtonDisabled)
});

export const getSaveButtonStyle = (enabled) => ({
  ...styles.button,
  ...styles.saveButton,
  ...(enabled ? {} : styles.saveButtonDisabled)
});

export const getCancelButtonStyle = () => ({
  ...styles.button,
  ...styles.cancelButton
});
