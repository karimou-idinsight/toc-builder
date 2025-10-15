'use client';

import React from 'react';
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

  // Calculate position for indicators (middle of the edge)
  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;

  // Determine if we have indicators to show
  const hasComments = data?.commentCount > 0;
  const hasAssumptions = data?.assumptions?.length > 0;
  const showIndicators = hasComments || hasAssumptions;

  const canComment = useSelector(selectCanComment);

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
                }}
                title={`${data.commentCount} comment${data.commentCount > 1 ? 's' : ''}`}
              >
                <FontAwesomeIcon icon={faComment} style={{ fontSize: '10px' }} />
              </div>
            )}

            {/* Assumption indicator */}
            {hasAssumptions && (
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
                  cursor: 'pointer',
                }}
                title={`${data.assumptions.length} assumption${data.assumptions.length > 1 ? 's' : ''}`}
              >
                <FontAwesomeIcon icon={faLightbulb} style={{ fontSize: '10px' }} />
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
