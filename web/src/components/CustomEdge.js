'use client';

import React, { useState } from 'react';
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

            {/* Assumption indicator with popover */}
            {hasAssumptions && (
              <div
                style={{ position: 'relative', zIndex: 1 }}
                onMouseEnter={() => setShowAssumptionsPopover(true)}
                onMouseLeave={() => setShowAssumptionsPopover(false)}
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

                {/* Assumptions Popover */}
                {showAssumptionsPopover && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginTop: '8px',
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                      padding: '12px',
                      minWidth: '300px',
                      maxWidth: '400px',
                      zIndex: 10001,
                      animation: 'fadeIn 0.15s ease-out',
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
                  </div>
                )}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
