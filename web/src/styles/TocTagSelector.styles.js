export const styles = {
  // Container styles
  container: {
    position: 'relative',
    minWidth: '250px'
  },

  // Input field container styles
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    minHeight: '38px'
  },

  // Placeholder text styles
  placeholder: {
    color: '#9ca3af',
    fontSize: '14px'
  },

  // Selected tags container styles
  selectedTagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    flex: 1
  },

  // Selected tag styles
  selectedTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },

  // Remove tag button styles
  removeTagButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '0',
    fontSize: '14px',
    lineHeight: '1'
  },

  // Dropdown arrow styles
  dropdownArrow: {
    marginLeft: 'auto',
    color: '#6b7280'
  },

  // Dropdown styles
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: 1000,
    maxHeight: '300px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },

  // Search input container styles
  searchInputContainer: {
    padding: '8px',
    borderBottom: '1px solid #e5e7eb'
  },

  // Search input styles
  searchInput: {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },

  // Tags list container styles
  tagsListContainer: {
    overflowY: 'auto',
    maxHeight: '200px'
  },

  // No tags found styles
  noTagsFound: {
    padding: '12px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px'
  },

  // Tag option styles
  tagOption: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f3f4f6'
  },

  tagOptionSelected: {
    backgroundColor: '#eff6ff'
  },

  tagOptionUnselected: {
    backgroundColor: 'white'
  },

  tagOptionHover: {
    backgroundColor: '#f9fafb'
  },

  // Checkbox styles
  checkbox: {
    width: '16px',
    height: '16px',
    marginRight: '8px',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  checkboxSelected: {
    border: '2px solid #3b82f6',
    backgroundColor: '#3b82f6'
  },

  checkboxUnselected: {
    border: '2px solid #d1d5db',
    backgroundColor: 'white'
  },

  // Tag text styles
  tagText: {
    fontSize: '14px',
    color: '#374151'
  },

  // Actions container styles
  actionsContainer: {
    padding: '8px',
    borderTop: '1px solid #e5e7eb'
  },

  // Clear all button styles
  clearAllButton: {
    width: '100%',
    padding: '6px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#6b7280',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer'
  },

  clearAllButtonHover: {
    backgroundColor: '#f9fafb'
  }
};

// Helper functions for dynamic styles
export const getTagOptionStyle = (selected, hovered) => ({
  ...styles.tagOption,
  ...(selected ? styles.tagOptionSelected : styles.tagOptionUnselected),
  ...(hovered && !selected ? styles.tagOptionHover : {})
});

export const getCheckboxStyle = (selected) => ({
  ...styles.checkbox,
  ...(selected ? styles.checkboxSelected : styles.checkboxUnselected)
});

export const getClearAllButtonStyle = (hovered) => ({
  ...styles.clearAllButton,
  ...(hovered ? styles.clearAllButtonHover : {})
});
