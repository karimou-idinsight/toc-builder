'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { tocToolbarStyles } from '../styles/TocToolbar.styles';
import { selectBoard } from '../store/selectors';

export default function TocToolbar({
  linkMode,
  onStartLinkMode,
  onExitLinkMode,
  onAddIntermediateOutcome
}) {
  // Get board from Redux instead of props
  const board = useSelector(selectBoard);
  const [isClient, setIsClient] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);

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
    <div style={tocToolbarStyles.container}>
      <div>
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          
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
        </div>

      </div>

    </div>
  );
}