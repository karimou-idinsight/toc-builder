'use client';

import React from 'react';
import { tocNodeStyles } from '../styles/TocNode.styles';
import { tocToolbarStyles } from '../styles/TocToolbar.styles';
import TocNodeTags from './TocNodeTags';

export default function TocNodeContent({
  node,
  showDetails,
  setShowDetails,
  connectedNodes,
  linkMode,
  isLinkSource,
  hoveredButton,
  setHoveredButton
}) {
  const isConnected = connectedNodes && connectedNodes.length > 0;

  return (
    <>
      <h3 
        style={{
          ...tocNodeStyles.title,
          ...(linkMode && isLinkSource ? tocNodeStyles.linkSourceTitle : {})
        }}
      >
        {node.title}
      </h3>
      
      {node.description && (
        <div style={tocNodeStyles.description}>
          {showDetails ? (
            <div>{node.description}</div>
          ) : (
            <div>
              {node.description.length > 100 
                ? `${node.description.substring(0, 100)}...` 
                : node.description}
            </div>
          )}
          {node.description.length > 100 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              style={{
                ...tocToolbarStyles.button,
                ...tocToolbarStyles.buttonSecondary,
                fontSize: '0.7rem',
                padding: '0.125rem 0.25rem',
                marginTop: '0.25rem',
                ...(hoveredButton === 'details' ? tocToolbarStyles.buttonSecondaryHover : {})
              }}
              onMouseEnter={() => setHoveredButton('details')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              {showDetails ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
      )}

      <TocNodeTags tags={node.tags} />
    </>
  );
}