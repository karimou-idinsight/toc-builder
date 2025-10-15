export const styles = {
  // Container styles
  container: {
    position: 'relative',
    width: '100%'
  },

  // Input container styles
  inputContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    alignItems: 'center',
    padding: '6px 8px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    minHeight: '38px',
    cursor: 'text'
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
    lineHeight: '1',
    fontWeight: 'bold'
  },

  // Input field styles
  input: {
    flex: 1,
    minWidth: '100px',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: 'transparent'
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
    maxHeight: '250px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },

  // Dropdown content styles
  dropdownContent: {
    overflowY: 'auto',
    maxHeight: '250px'
  },

  // Create new tag option styles
  createNewTagOption: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    cursor: 'pointer',
    backgroundColor: '#f0f9ff',
    borderBottom: '1px solid #e0f2fe'
  },

  createNewTagOptionHover: {
    backgroundColor: '#e0f2fe'
  },

  // Create new tag icon styles
  createNewTagIcon: {
    width: '20px',
    height: '20px',
    marginRight: '8px',
    backgroundColor: '#3b82f6',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold'
  },

  // Create new tag text styles
  createNewTagText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e40af'
  },

  createNewTagSubtext: {
    fontSize: '12px',
    color: '#6b7280'
  },

  // Existing tags section styles
  existingTagsSection: {
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #f3f4f6'
  },

  // Existing tag option styles
  existingTagOption: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    cursor: 'pointer',
    backgroundColor: 'white',
    borderBottom: '1px solid #f3f4f6'
  },

  existingTagOptionHover: {
    backgroundColor: '#f9fafb'
  },

  // Existing tag indicator styles
  existingTagIndicator: {
    width: '6px',
    height: '6px',
    marginRight: '10px',
    backgroundColor: '#3b82f6',
    borderRadius: '50%'
  },

  // Existing tag text styles
  existingTagText: {
    fontSize: '14px',
    color: '#374151'
  },

  // No results styles
  noResults: {
    padding: '12px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px'
  }
};

// Helper functions for dynamic styles
export const getCreateNewTagOptionStyle = (hovered) => ({
  ...styles.createNewTagOption,
  ...(hovered ? styles.createNewTagOptionHover : {})
});

export const getExistingTagOptionStyle = (hovered) => ({
  ...styles.existingTagOption,
  ...(hovered ? styles.existingTagOptionHover : {})
});
