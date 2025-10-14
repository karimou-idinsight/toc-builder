'use client';

import React from 'react';
import { tocNodeStyles } from '../styles/TocNode.styles';

export default function TocNodeContextMenu({
  show,
  position,
  onClose,
  onMoveNode,
  onStartLinking,
  onEdit,
  onDuplicate,
  onShowCausalPath,
  onDelete,
  hoveredButton,
  setHoveredButton
}) {
  if (!show) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        }}
        onClick={onClose}
      />
      <div
        style={{
          ...tocNodeStyles.contextMenu,
          top: position.y,
          left: position.x,
        }}
      >
        <button
          style={{
            ...tocNodeStyles.contextMenuItem,
            ...(hoveredButton === 'move' ? tocNodeStyles.contextMenuItemHover : {})
          }}
          onClick={onMoveNode}
          onMouseEnter={() => setHoveredButton('move')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          🔄 Move Node
        </button>
        
        <button
          style={{
            ...tocNodeStyles.contextMenuItem,
            ...(hoveredButton === 'link' ? tocNodeStyles.contextMenuItemHover : {})
          }}
          onClick={onStartLinking}
          onMouseEnter={() => setHoveredButton('link')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          🔗 Draw Arrow
        </button>
        
        <button
          style={{
            ...tocNodeStyles.contextMenuItem,
            ...(hoveredButton === 'edit-ctx' ? tocNodeStyles.contextMenuItemHover : {})
          }}
          onClick={onEdit}
          onMouseEnter={() => setHoveredButton('edit-ctx')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          ✏️ Edit
        </button>
        
        <button
          style={{
            ...tocNodeStyles.contextMenuItem,
            ...(hoveredButton === 'duplicate-ctx' ? tocNodeStyles.contextMenuItemHover : {})
          }}
          onClick={onDuplicate}
          onMouseEnter={() => setHoveredButton('duplicate-ctx')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          📋 Duplicate
        </button>
        
        <button
          style={{
            ...tocNodeStyles.contextMenuItem,
            ...(hoveredButton === 'causalpath-ctx' ? tocNodeStyles.contextMenuItemHover : {})
          }}
          onClick={onShowCausalPath}
          onMouseEnter={() => setHoveredButton('causalpath-ctx')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          🔗 Show Causal Path
        </button>
        
        <button
          style={{
            ...tocNodeStyles.contextMenuItem,
            ...tocNodeStyles.contextMenuItemDanger,
            ...(hoveredButton === 'delete-ctx' ? tocNodeStyles.contextMenuItemDangerHover : {})
          }}
          onClick={onDelete}
          onMouseEnter={() => setHoveredButton('delete-ctx')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          🗑️ Delete
        </button>
      </div>
    </>
  );
}