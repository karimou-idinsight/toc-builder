'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { tocNodeStyles } from '../styles/TocNode.styles';
import { tocToolbarStyles } from '../styles/TocToolbar.styles';
import TocNodeEditForm from './TocNodeEditForm';
import TocNodeContent from './TocNodeContent';
import TocNodeContextMenu from './TocNodeContextMenu';
import TocNodeEditDialog from './TocNodeEditDialog';

export default function TocNode({
  node,
  isDragging = false,
  onUpdate = () => {},
  onDelete = () => {},
  onDuplicate = () => {},
  onClick = () => {},
  linkMode,
  isLinkSource,
  connectedNodes= [],
  isDraggable = false,
  onToggleDraggable,
  onStartLinking,
  onShowCausalPath,
  causalPathMode = false,
  isInCausalPath = false,
  allNodes = [],
  board = {},
  onAddEdge = () => {},
  onDeleteEdge = () => {}
}) {
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const [editDescription, setEditDescription] = useState(node.description);
  const [showDetails, setShowDetails] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showEditDialog, setShowEditDialog] = useState(false);

useEffect(() => {
    console.log('Node props changed:', { node, isDraggable, linkMode });
}, [node, isDraggable, linkMode]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({
    id: node.id,
    data: {
      type: 'node',
      nodeId: node.id,
      listId: node.listId
    },
    disabled: !isDraggable // Only allow dragging when isDraggable is true
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.8 : 1
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onUpdate(node.id, {
        title: editTitle,
        description: editDescription
      });
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setEditTitle(node.title);
    setEditDescription(node.description);
    setIsEditing(false);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (linkMode) {
      onClick(node.id);
    } else {
      // Show context menu on click
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    }
  };

  const handleContextMenuClose = () => {
    setShowContextMenu(false);
  };

  const handleMoveNode = () => {
    setShowContextMenu(false);
    if (onToggleDraggable) {
      onToggleDraggable(node.id, true);
    }
  };

  const handleStartLinking = () => {
    setShowContextMenu(false);
    if (onStartLinking) {
      onStartLinking(node.id);
    }
  };

  const handleEditFromContext = () => {
    setShowContextMenu(false);
    setShowEditDialog(true);
  };

  const handleDuplicateFromContext = () => {
    setShowContextMenu(false);
    onDuplicate(node.id);
  };

  const handleShowCausalPathFromContext = () => {
    setShowContextMenu(false);
    onShowCausalPath(node.id);
  };

  const handleDeleteFromContext = () => {
    setShowContextMenu(false);
    if (confirm('Delete this node?')) {
      onDelete(node.id);
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (!linkMode) {
      setIsEditing(true);
    }
  };

  const isConnected = connectedNodes.length > 0;

  const getNodeContainerStyle = () => {
    let containerStyle = {
      ...style,
      ...tocNodeStyles.container,
      cursor: isDraggable ? 'grab' : 'pointer'
    };

    if (isHovered) {
      containerStyle = { ...containerStyle, ...tocNodeStyles.containerHover };
    }
    
    if (linkMode) {
      containerStyle = { ...containerStyle, ...tocNodeStyles.containerLinkMode };
      if (isHovered) {
        containerStyle = { ...containerStyle, ...tocNodeStyles.containerLinkModeHover };
      }
    }
    
    if (isLinkSource) {
      containerStyle = { ...containerStyle, ...tocNodeStyles.containerLinkSource };
    }
    
    if (isConnected) {
      containerStyle = { ...containerStyle, ...tocNodeStyles.containerConnected };
    }

    // Add causal path highlighting
    if (causalPathMode && isInCausalPath) {
      containerStyle = { 
        ...containerStyle, 
        border: '3px solid #f59e0b',
        boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)'
      };
    }

    // Add visual feedback when long press is active (no longer used but keeping the structure clean)
    return containerStyle;
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={getNodeContainerStyle()}
        onClick={handleClick}
        onContextMenu={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-node-id={node.id}
        {...attributes}
        {...(isDraggable ? listeners : {})}
      >
        {/* Draggable indicator */}
        {isDraggable && (
          <div style={tocNodeStyles.draggableIndicator} />
        )}

      <div style={tocNodeStyles.content}>
        {isEditing ? (
          <TocNodeEditForm
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editDescription={editDescription}
            setEditDescription={setEditDescription}
            onSubmit={handleEdit}
            onCancel={handleEditCancel}
            hoveredButton={hoveredButton}
            setHoveredButton={setHoveredButton}
          />
        ) : (
          <TocNodeContent
            node={node}
            showDetails={showDetails}
            setShowDetails={setShowDetails}
            onEdit={() => setIsEditing(true)}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onShowConnectionDetails={() => setShowDetails(!showDetails)}
            connectedNodes={connectedNodes || []}
            linkMode={linkMode}
            isLinkSource={isLinkSource}
            hoveredButton={hoveredButton}
            setHoveredButton={setHoveredButton}
          />
        )}
      </div>

        {linkMode && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: `2px dashed ${isLinkSource ? 'orange' : '#10b981'}`,
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#065f46',
            pointerEvents: 'none'
          }}>
          </div>
        )}
      </div>

      <TocNodeContextMenu
        show={showContextMenu}
        position={contextMenuPosition}
        onClose={handleContextMenuClose}
        onMoveNode={handleMoveNode}
        onStartLinking={handleStartLinking}
        onEdit={handleEditFromContext}
        onDuplicate={handleDuplicateFromContext}
        onShowCausalPath={handleShowCausalPathFromContext}
        onDelete={handleDeleteFromContext}
        hoveredButton={hoveredButton}
        setHoveredButton={setHoveredButton}
      />
      
      <TocNodeEditDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSave={onUpdate}
        node={node}
        allNodes={allNodes}
        board={board}
        onAddEdge={onAddEdge}
        onDeleteEdge={onDeleteEdge}
      />
    </>
  );
}