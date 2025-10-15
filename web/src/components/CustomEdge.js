'use client';

import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getStraightPath } from 'reactflow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';

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
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Calculate position for comment indicator (middle of the edge)
  const commentX = (sourceX + targetX) / 2;
  const commentY = (sourceY + targetY) / 2;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        markerEnd={markerEnd}
      />
      
      {/* Comment indicator */}
      {data?.commentCount > 0 && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${commentX}px,${commentY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
              zIndex: 1,
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
              }}
              title={`${data.commentCount} comment${data.commentCount > 1 ? 's' : ''}`}
            >
              <FontAwesomeIcon icon={faComment} style={{ fontSize: '10px' }} />
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
