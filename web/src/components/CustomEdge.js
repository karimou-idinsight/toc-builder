'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { selectCanComment } from '../store/selectors';
 

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [showAssumptionsPopover, setShowAssumptionsPopover] = useState(false);
  const [showCommentsPopover, setShowCommentsPopover] = useState(false);
  const [assumptionsPopoverPosition, setAssumptionsPopoverPosition] = useState({ top: 0, left: 0 });
  const [commentsPopoverPosition, setCommentsPopoverPosition] = useState({ top: 0, left: 0 });
  const assumptionIconRef = useRef(null);
  const commentIconRef = useRef(null);
  const assumptionsPopoverRef = useRef(null);
  const commentsPopoverRef = useRef(null);

  // Calculate position for indicators (middle of the edge)
  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;

  // Determine if we have indicators to show
  const hasComments = data?.commentCount > 0;
  const hasAssumptions = data?.assumptions?.length > 0;
  const showIndicators = hasComments || hasAssumptions;

  const canComment = useSelector(selectCanComment);

  // Handle click outside to close popovers
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close comments popover if click is outside
      if (showCommentsPopover && 
          commentIconRef.current && 
          !commentIconRef.current.contains(event.target) &&
          commentsPopoverRef.current &&
          !commentsPopoverRef.current.contains(event.target)) {
        setShowCommentsPopover(false);
      }
      
      // Close assumptions popover if click is outside
      if (showAssumptionsPopover && 
          assumptionIconRef.current && 
          !assumptionIconRef.current.contains(event.target) &&
          assumptionsPopoverRef.current &&
          !assumptionsPopoverRef.current.contains(event.target)) {
        setShowAssumptionsPopover(false);
      }
    };

    if (showCommentsPopover || showAssumptionsPopover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCommentsPopover, showAssumptionsPopover]);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        markerEnd={markerEnd}
      />
      
      {/* Indicators container */}
      {showIndicators && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${centerX}px,${centerY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
              zIndex: 1,
              display: 'flex',
              gap: '4px',
            }}
          >
            {/* Comment indicator */}
            {(hasComments && canComment)&& (
              <div
                ref={commentIconRef}
                style={{ position: 'relative', zIndex: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (commentIconRef.current) {
                    const rect = commentIconRef.current.getBoundingClientRect();
                    setCommentsPopoverPosition({
                      top: rect.bottom + 8,
                      left: rect.left + rect.width / 2 - 150, // Center the 300px popover
                    });
                  }
                  setShowCommentsPopover(!showCommentsPopover);
                  // Close assumptions popover if open
                  if (showAssumptionsPopover) setShowAssumptionsPopover(false);
                }}
              >
                <div
                  className="comment-indicator"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '10px',
                    fontWeight: '600',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer',
                    position: 'relative',
                    zIndex: 1,
                  }}
                  title={`${data.commentCount} comment${data.commentCount > 1 ? 's' : ''}`}
                >
                  <FontAwesomeIcon icon={faComment} style={{ fontSize: '10px' }} />
                </div>
              </div>
            )}

            {/* Assumption indicator */}
            {hasAssumptions && (
              <div
                ref={assumptionIconRef}
                style={{ position: 'relative', zIndex: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (assumptionIconRef.current) {
                    const rect = assumptionIconRef.current.getBoundingClientRect();
                    setAssumptionsPopoverPosition({
                      top: rect.bottom + 8,
                      left: rect.left + rect.width / 2 - 150, // Center the 300px popover
                    });
                  }
                  setShowAssumptionsPopover(!showAssumptionsPopover);
                  // Close comments popover if open
                  if (showCommentsPopover) setShowCommentsPopover(false);
                }}
              >
                <div
                  className="assumption-indicator"
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
                    zIndex: 1,
                  }}
                  title={`${data.assumptions.length} assumption${data.assumptions.length > 1 ? 's' : ''}`}
                >
                  <FontAwesomeIcon icon={faLightbulb} style={{ fontSize: '10px' }} />
                </div>
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Render comments popover as a portal to avoid z-index issues */}
      {showCommentsPopover && typeof document !== 'undefined' && data?.comments && createPortal(
        <div
          ref={commentsPopoverRef}
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
            <FontAwesomeIcon icon={faComment} style={{ color: '#6b7280' }} />
            <span>Comments ({data.commentCount})</span>
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
            {data.comments.map((comment, index) => (
              <div
                key={comment.id || index}
                style={{
                  fontSize: '11px',
                  color: '#4b5563',
                  padding: '8px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '4px',
                  borderLeft: '3px solid #6b7280',
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

          {/* Arrow pointing up */}
          <div
            style={{
              position: 'absolute',
              top: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '12px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRight: 'none',
              borderBottom: 'none',
              transform: 'translateX(-50%) rotate(45deg)',
            }}
          />
        </div>,
        document.body
      )}

      {/* Render assumptions popover as a portal to avoid z-index issues */}
      {showAssumptionsPopover && typeof document !== 'undefined' && createPortal(
        <div
          ref={assumptionsPopoverRef}
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
            <span>Assumptions ({data.assumptions.length})</span>
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
            {data.assumptions.map((assumption, index) => (
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

          {/* Arrow pointing up */}
          <div
            style={{
              position: 'absolute',
              top: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '12px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRight: 'none',
              borderBottom: 'none',
              transform: 'translateX(-50%) rotate(45deg)',
            }}
          />
        </div>,
        document.body
      )}
    </>
  );
}
