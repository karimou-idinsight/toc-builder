'use client';

import React from 'react';
import { tocNodeStyles } from '../styles/TocNode.styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsAlt, faEdit, faLink, faCopy, faProjectDiagram, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function TocNodeFooter({
  onMoveNode,
  onStartLinking,
  onEdit,
  onDuplicate,
  onShowCausalPath,
  onExitCausalPathMode,
  onDelete,
  hoveredButton,
  causalPathMode,
  isCausalPathFocalNode,
  setHoveredButton
}) {
  const handleCausalPathClick = () => {
    if (causalPathMode && isCausalPathFocalNode) {
      onExitCausalPathMode();
    } else {
      onShowCausalPath();
    }
  }
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      marginTop: '0.5rem',
      justifyContent: 'flex-end',
      borderTop: '1px solid',
      padding: '0.25rem',
      zIndex: 1000,
      opacity: 1
    }}>
      <button
        style={{
          ...tocNodeStyles.actionButton,
          opacity: 1,
          background: hoveredButton === 'move' ? '#f3f4f6' : 'transparent',
          border: 'none'
        }}
        title="Move Node"
        onClick={onMoveNode}
        onMouseEnter={() => setHoveredButton('move')}
        onMouseLeave={() => setHoveredButton(null)}
      >
        <FontAwesomeIcon icon={faArrowsAlt} />
      </button>
      <button
        style={{
          ...tocNodeStyles.actionButton,
          opacity: 1,
          background: hoveredButton === 'edit-ctx' ? '#f3f4f6' : 'transparent',
          border: 'none'
        }}
        title="Edit"
        onClick={onEdit}
        onMouseEnter={() => setHoveredButton('edit-ctx')}
        onMouseLeave={() => setHoveredButton(null)}
      >
        <FontAwesomeIcon icon={faEdit} />
      </button>
      <button
        style={{
          ...tocNodeStyles.actionButton,
          opacity: 1,
          background: hoveredButton === 'link' ? '#f3f4f6' : 'transparent',
          border: 'none'
        }}
        title="Draw Arrow"
        onClick={onStartLinking}
        onMouseEnter={() => setHoveredButton('link')}
        onMouseLeave={() => setHoveredButton(null)}
      >
        <FontAwesomeIcon icon={faLink} />
      </button>
      <button
        style={{
          ...tocNodeStyles.actionButton,
          opacity: 1,
          background: hoveredButton === 'duplicate-ctx' ? '#f3f4f6' : 'transparent',
          border: 'none'
        }}
        title="Duplicate"
        onClick={onDuplicate}
        onMouseEnter={() => setHoveredButton('duplicate-ctx')}
        onMouseLeave={() => setHoveredButton(null)}
      >
        <FontAwesomeIcon icon={faCopy} />
      </button>
      <button
        style={{
          ...tocNodeStyles.actionButton,
          opacity: 1,
          background: hoveredButton === 'causalpath-ctx' ? '#f3f4f6' : 'transparent',
          border: 'none',
          color: causalPathMode && isCausalPathFocalNode ? '#d30fddff' : 'inherit'
        }}
        title="Show Causal Path"
        onClick={handleCausalPathClick}
        onMouseEnter={() => setHoveredButton('causalpath-ctx')}
        onMouseLeave={() => setHoveredButton(null)}
      >
        <FontAwesomeIcon icon={faProjectDiagram} />
      </button>
      <button
        style={{
          ...tocNodeStyles.actionButton,
          ...tocNodeStyles.contextMenuItemDanger,
          opacity: 1,
          background: hoveredButton === 'delete-ctx' ? '#f3f4f6' : 'transparent',
          border: 'none'
        }}
        title="Delete"
        onClick={onDelete}
        onMouseEnter={() => setHoveredButton('delete-ctx')}
        onMouseLeave={() => setHoveredButton(null)}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  );
}
