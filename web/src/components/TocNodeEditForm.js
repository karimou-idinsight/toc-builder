'use client';

import React from 'react';
import { tocNodeStyles } from '../styles/TocNode.styles';
import { tocToolbarStyles } from '../styles/TocToolbar.styles';

export default function TocNodeEditForm({
  editTitle,
  setEditTitle,
  editDescription,
  setEditDescription,
  onSubmit,
  onCancel,
  hoveredButton,
  setHoveredButton
}) {
  return (
    <form onSubmit={onSubmit} style={tocNodeStyles.editForm}>
      <input
        type="text"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        placeholder="Node title"
        autoFocus
        style={{
          ...tocNodeStyles.input,
          ...(hoveredButton === 'titleInput' ? tocNodeStyles.inputFocus : {})
        }}
        onFocus={() => setHoveredButton('titleInput')}
        onBlur={() => setHoveredButton(null)}
      />
      <textarea
        value={editDescription}
        onChange={(e) => setEditDescription(e.target.value)}
        placeholder="Description (optional)"
        rows="3"
        style={{
          ...tocNodeStyles.input,
          resize: 'vertical',
          ...(hoveredButton === 'descInput' ? tocNodeStyles.inputFocus : {})
        }}
        onFocus={() => setHoveredButton('descInput')}
        onBlur={() => setHoveredButton(null)}
      />
      <div style={tocNodeStyles.editActions}>
        <button 
          type="submit"
          style={{
            ...tocToolbarStyles.button,
            ...tocToolbarStyles.buttonPrimary,
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem',
            ...(hoveredButton === 'save' ? tocToolbarStyles.buttonPrimaryHover : {})
          }}
          onMouseEnter={() => setHoveredButton('save')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          Save
        </button>
        <button 
          type="button"
          onClick={onCancel}
          style={{
            ...tocToolbarStyles.button,
            ...tocToolbarStyles.buttonSecondary,
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem',
            ...(hoveredButton === 'cancel' ? tocToolbarStyles.buttonSecondaryHover : {})
          }}
          onMouseEnter={() => setHoveredButton('cancel')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}