'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { tocToolbarStyles } from '../styles/TocToolbar.styles';
import { selectBoard, selectCanEdit } from '../store/selectors';
import TocTagSelector from './TocTagSelector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faProjectDiagram } from '@fortawesome/free-solid-svg-icons';


export default function TocToolbar({
  linkMode,
  onStartLinkMode,
  onExitLinkMode,
  onAddIntermediateOutcome,
  selectedTags,
  onTagsChange,
  allTags,
  boardId,
  onExitCausalMode,
  showExitCausal
}) {
  const router = useRouter();
  const { user } = useAuth();
  // Get board from Redux instead of props
  const board = useSelector(selectBoard);
  const [isClient, setIsClient] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const canEdit = useSelector(selectCanEdit);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getButtonStyle = (buttonType, isActive = false) => {
    const baseStyle = { ...tocToolbarStyles.button };
    
    if (isActive) {
      return { ...baseStyle, ...tocToolbarStyles.buttonHover };
    }
    
    if (hoveredButton === buttonType) {
      if (buttonType === 'secondary') {
        return { ...baseStyle, ...tocToolbarStyles.buttonSecondary, ...tocToolbarStyles.buttonSecondaryHover };
      }
      return { ...baseStyle, ...tocToolbarStyles.buttonHover };
    }
    
    if (buttonType === 'secondary') {
      return { ...baseStyle, ...tocToolbarStyles.buttonSecondary };
    }
    
    return baseStyle;
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div style={tocToolbarStyles.container}>
        <div>
          <h2 style={tocToolbarStyles.title}>Theory of Change Board</h2>
          <span>Loading...</span>
        </div>
        <div style={tocToolbarStyles.actions}>
          <button style={tocToolbarStyles.button} disabled>Loading...</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={tocToolbarStyles.container}>
        <div>
          {user && boardId && boardId !== 'default' && (
            <button
              onClick={() => router.push('/boards')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#3b82f6',
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.25rem 0',
                marginBottom: '0.5rem'
              }}
            >
              ← Back to My Boards
            </button>
          )}
          <h2 style={tocToolbarStyles.title}>{board.name}</h2>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {board.lists.length} lists • {board.nodes.length} nodes • {board.edges.length} connections
            {board.lists.filter(l => l.type === 'intermediate').length > 1 && (
              <span>
                • {board.lists.filter(l => l.type === 'intermediate').length} intermediate stages
              </span>
            )}
          </span>
        </div>

        <div style={tocToolbarStyles.actions}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {canEdit && (
              <>
                {linkMode ? (
                  <button
                    style={getButtonStyle('danger')}
                    onClick={onExitLinkMode}
                    onMouseEnter={() => setHoveredButton('exitLink')}
                    onMouseLeave={() => setHoveredButton(null)}
                    title="Exit link mode"
                  >
                    Exit Link Mode
                  </button>
                ) : (
                  <button
                    style={getButtonStyle('link')}
                    onClick={onStartLinkMode}
                    onMouseEnter={() => setHoveredButton('link')}
                    onMouseLeave={() => setHoveredButton(null)}
                    title="Start connecting nodes"
                  >
                    Connect Nodes
                  </button>
                )}

                <button
                  style={getButtonStyle('intermediate')}
                  onClick={onAddIntermediateOutcome}
                  onMouseEnter={() => setHoveredButton('intermediate')}
                  onMouseLeave={() => setHoveredButton(null)}
                  title="Add intermediate outcome stage"
                >
                  + Add Intermediate Outcome
                </button>
              </>
            )}
            
          </div>

        </div>

      </div>
      
      {/* Tag Filter Section - More Visible */}
      <div style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <label style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#374151',
          whiteSpace: 'nowrap'
        }}>
          🏷️ Filter by Tags:
        </label>
        <div style={{ flex: '0 0 auto', minWidth: '350px', maxWidth: '500px' }}>
          <TocTagSelector
            allTags={allTags}
            selectedTags={selectedTags}
            onTagsChange={onTagsChange}
          />
        </div>
        {selectedTags.length > 0 && (
          <span style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            Showing {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''}
          </span>
        )}
        <div style={{ marginLeft: 'auto' }}>
          {showExitCausal && typeof onExitCausalMode === 'function' && (
            <button
              onClick={onExitCausalMode}
              title="Exit Causal Mode"
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
                cursor: 'pointer'
              }}
            >
              <FontAwesomeIcon icon={faProjectDiagram} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}