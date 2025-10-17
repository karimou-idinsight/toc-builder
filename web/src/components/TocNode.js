'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { tocNodeStyles } from '../styles/TocNode.styles';
import { tocToolbarStyles } from '../styles/TocToolbar.styles';
import TocNodeEditForm from './TocNodeEditForm';
import TocNodeContent from './TocNodeContent';
import TocNodeContextMenu from './TocNodeContextMenu';
import TocNodeEditDialog from './TocNodeEditDialog';
import TocNodeFooter from './TocNodeFooter';
import {
  selectLinkMode,
  selectLinkSource,
  selectCausalPathMode,
  selectCausalPathNodesSet,
  selectCausalPathFocalNodes,
  selectAllNodes,
  selectBoard,
  selectAllLists,
  selectCanEdit,
  selectCanComment,
  selectAllEdges
} from '../store/selectors';


export default function TocNode({
  node,
  isDragging = false,
  onUpdate = () => {},
  onDelete = () => {},
  onDuplicate = () => {},
  onClick = () => {},
  connectedNodes= [],
  isDraggable = false,
  onToggleDraggable,
  onStartLinking,
  onShowCausalPath,
  onExitCausalPathMode,
  onAddEdge = () => {},
  onDeleteEdge = () => {}
}) {
  // Get UI state from Redux
  const linkMode = useSelector(selectLinkMode);
  const linkSource = useSelector(selectLinkSource);
  const causalPathMode = useSelector(selectCausalPathMode);
  const causalPathNodes = useSelector(selectCausalPathNodesSet);
  const causalPathFocalNodes = useSelector(selectCausalPathFocalNodes);
  const allNodes = useSelector(selectAllNodes);
  const board = useSelector(selectBoard);
  const allLists = useSelector(selectAllLists);
  const allEdges = useSelector(selectAllEdges);
  
  // Get permissions from Redux
  const userCanEdit = useSelector(selectCanEdit);
  const userCanComment = useSelector(selectCanComment);
  
  // Get the list this node belongs to
  const nodeList = allLists.find(list => list.id === node.listId);
  const listColor = nodeList?.color || '#3b82f6'; // Default to blue if no list color
  
  // Computed values
  const isLinkSource = linkSource === node.id;
  const isInCausalPath = causalPathNodes.has(node.id);
  const isCausalPathFocalNode = Array.isArray(causalPathFocalNodes) && causalPathFocalNodes.includes(node.id);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const [editDescription, setEditDescription] = useState(node.description);
  const [showDetails, setShowDetails] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showAssumptionsPopover, setShowAssumptionsPopover] = useState(false);
  const [showCommentsPopover, setShowCommentsPopover] = useState(false);
  const [assumptionsPopoverPosition, setAssumptionsPopoverPosition] = useState({ top: 0, left: 0 });
  const [commentsPopoverPosition, setCommentsPopoverPosition] = useState({ top: 0, left: 0 });
  const assumptionIconRef = useRef(null);
  const commentIconRef = useRef(null);

  const canComment = useSelector(selectCanComment);

  // Get all assumptions for edges connected to this node
  const nodeAssumptions = allEdges
    .filter(edge => edge.sourceId === node.id || edge.targetId === node.id)
    .flatMap(edge => edge.assumptions || [])
    .filter((assumption, index, self) => 
      // Remove duplicates based on assumption id
      index === self.findIndex(a => a.id === assumption.id)
    );
  
  const hasAssumptions = nodeAssumptions.length > 0;

  // Notify edge redraw on hover change (node height change)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toc-node-hover', { detail: { nodeId: node.id, hovered: isHovered } }));
    }
  }, [isHovered, node.id]);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showEditDialog, setShowEditDialog] = useState(false);

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
    if (!userCanEdit && !userCanComment) return;
    setShowContextMenu(false);
    setShowEditDialog(true);
  };

  const handleDuplicateFromContext = () => {
    if (!userCanEdit) return;
    setShowContextMenu(false);
    onDuplicate(node.id);
  };

  const handleShowCausalPathFromContext = () => {
    setShowContextMenu(false);
    onShowCausalPath(node.id);
  };

  const handleExitCausalPathModeFromContext = () => {
    setShowContextMenu(false);
    onExitCausalPathMode(node.id);
  }

  const handleDeleteFromContext = () => {
    setShowContextMenu(false);
    if (confirm('Delete this node?')) {
      onDelete(node.id);
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (!linkMode && userCanEdit) {
      setIsEditing(true);
    }
  };

  const isConnected = connectedNodes.length > 0;

  const hexToRgb = (hex) => {
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(node.color)) {
          // Convert hex to rgb
          let c = node.color.substring(1);
          if (c.length === 3) {
            c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
          }
          const rgb = [
            parseInt(c.substring(0,2),16),
            parseInt(c.substring(2,4),16),
            parseInt(c.substring(4,6),16)
          ];
    return rgb;
    }
}

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

    const rgb = hexToRgb(node.color) || [245, 158, 11];
    if (isConnected) {
      containerStyle = { ...containerStyle, ...tocNodeStyles.containerConnected };
      if (node.color) {
        containerStyle.borderColor = node.color;
        // If color is hex, convert to rgba for opacity
        if (rgb) {
            containerStyle.backgroundColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.1)`; // 10% opacity
        } else {
          containerStyle.backgroundColor = node.color;
        }
      }
    }

    // Highlight the focal node in causal path mode
    if (causalPathMode && isCausalPathFocalNode) {
      containerStyle = { 
        ...containerStyle, 
        border: `3px solid ${ node.color || '#f59e0b' }`,
        boxShadow: `0 0 20px rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.6)`,
        transform: containerStyle.transform || 'scale(1)',
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

        {/* Comment indicator */}
        {(node.commentCount > 0 && canComment) && (
          <div
            ref={commentIconRef}
            style={{
              position: 'absolute',
              top: '4px',
              right: hasAssumptions ? '28px' : '4px', // Shift left if assumptions are present
              zIndex: 1,
            }}
            onMouseEnter={(e) => {
              if (commentIconRef.current) {
                const rect = commentIconRef.current.getBoundingClientRect();
                setCommentsPopoverPosition({
                  top: rect.bottom + 8,
                  left: rect.right - 300, // Align right edge of popover with right edge of icon
                });
              }
              setShowCommentsPopover(true);
            }}
            onMouseLeave={() => setShowCommentsPopover(false)}
          >
            <div style={{
              backgroundColor: listColor,
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '600',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              cursor: 'help',
              position: 'relative',
              zIndex: 1,
            }}
            title={`${node.commentCount} comment${node.commentCount > 1 ? 's' : ''}`}
            >
              <FontAwesomeIcon icon={faComment} style={{ fontSize: '10px' }} />
            </div>
          </div>
        )}

        {/* Assumptions indicator with popover */}
        {hasAssumptions && (
          <div
            ref={assumptionIconRef}
            style={{ position: 'absolute', top: '4px', right: '4px', zIndex: 2 }}
            onMouseEnter={(e) => {
              if (assumptionIconRef.current) {
                const rect = assumptionIconRef.current.getBoundingClientRect();
                setAssumptionsPopoverPosition({
                  top: rect.bottom + 8,
                  left: rect.right - 300, // Align right edge of popover with right edge of icon
                });
              }
              setShowAssumptionsPopover(true);
            }}
            onMouseLeave={() => setShowAssumptionsPopover(false)}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f59e0b',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '10px',
                fontWeight: '600',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                cursor: 'help',
                position: 'relative',
                zIndex: 2,
              }}
              title={`${nodeAssumptions.length} assumption${nodeAssumptions.length > 1 ? 's' : ''}`}
            >
              <FontAwesomeIcon icon={faLightbulb} style={{ fontSize: '10px' }} />
            </div>
          </div>
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
          <>
            <TocNodeContent
              node={node}
              showDetails={showDetails}
              setShowDetails={setShowDetails}
              onEdit={() => userCanEdit && setIsEditing(true)}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onShowConnectionDetails={() => setShowDetails(!showDetails)}
              connectedNodes={connectedNodes || []}
              linkMode={linkMode}
              isLinkSource={isLinkSource}
              hoveredButton={hoveredButton}
              setHoveredButton={setHoveredButton}
              canEdit={userCanEdit}
              canComment={userCanComment}
            />
            {(isHovered || (causalPathMode && isCausalPathFocalNode)) && (
              <TocNodeFooter
                onMoveNode={handleMoveNode}
                onStartLinking={handleStartLinking}
                onEdit={handleEditFromContext}
                onDuplicate={handleDuplicateFromContext}
                onShowCausalPath={handleShowCausalPathFromContext}
                onExitCausalPathMode={handleExitCausalPathModeFromContext}
                onDelete={handleDeleteFromContext}
                hoveredButton={hoveredButton}
                causalPathMode={causalPathMode}
                isCausalPathFocalNode={isCausalPathFocalNode}
                setHoveredButton={setHoveredButton}
              />
            )}
          </>
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

      {/* <TocNodeContextMenu
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
      /> */}
      
      <TocNodeEditDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSave={onUpdate}
        node={node}
        allNodes={allNodes}
        board={board}
        onAddEdge={onAddEdge}
        onDeleteEdge={onDeleteEdge}
        canEdit={userCanEdit}
        canComment={userCanComment}
      />

      {/* Render comments popover as a portal to avoid z-index issues */}
      {showCommentsPopover && typeof document !== 'undefined' && node.comments && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${commentsPopoverPosition.top}px`,
            left: `${commentsPopoverPosition.left}px`,
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            padding: '12px',
            minWidth: '300px',
            maxWidth: '400px',
            zIndex: 10001,
            animation: 'fadeIn 0.15s ease-out',
            pointerEvents: 'auto',
          }}
          onMouseEnter={() => setShowCommentsPopover(true)}
          onMouseLeave={() => setShowCommentsPopover(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FontAwesomeIcon icon={faComment} style={{ color: listColor }} />
            <span>Comments ({node.commentCount})</span>
          </div>

          <div
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {node.comments.map((comment, index) => (
              <div
                key={comment.id || index}
                style={{
                  fontSize: '11px',
                  color: '#4b5563',
                  padding: '8px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '4px',
                  borderLeft: `3px solid ${listColor}`,
                  lineHeight: '1.4'
                }}
              >
                <div style={{ marginBottom: '4px', fontWeight: '600', color: '#374151' }}>
                  {comment.user_name || 'Anonymous'}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  {comment.content}
                </div>
                {comment.created_at && (
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#9ca3af',
                      marginTop: '4px'
                    }}
                  >
                    {new Date(comment.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Render assumptions popover as a portal to avoid z-index issues */}
      {showAssumptionsPopover && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${assumptionsPopoverPosition.top}px`,
            left: `${assumptionsPopoverPosition.left}px`,
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            padding: '12px',
            minWidth: '300px',
            maxWidth: '400px',
            zIndex: 10001,
            animation: 'fadeIn 0.15s ease-out',
            pointerEvents: 'auto',
          }}
          onMouseEnter={() => setShowAssumptionsPopover(true)}
          onMouseLeave={() => setShowAssumptionsPopover(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FontAwesomeIcon icon={faLightbulb} style={{ color: '#f59e0b' }} />
            <span>Assumptions ({nodeAssumptions.length})</span>
          </div>

          <div
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {nodeAssumptions.map((assumption, index) => (
              <div
                key={assumption.id || index}
                style={{
                  fontSize: '11px',
                  color: '#4b5563',
                  padding: '8px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '4px',
                  borderLeft: `3px solid ${
                    assumption.strength === 'strong' ? '#10b981' :
                    assumption.strength === 'weak' ? '#ef4444' :
                    '#f59e0b'
                  }`,
                  lineHeight: '1.4'
                }}
              >
                <div style={{ marginBottom: '4px' }}>
                  {assumption.content}
                </div>
                {assumption.strength && (
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#9ca3af',
                      textTransform: 'capitalize',
                      marginTop: '4px'
                    }}
                  >
                    Strength: {assumption.strength}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}