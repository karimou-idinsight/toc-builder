'use client';

import React from 'react';

export default function TocNodeTags({ tags }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
      {tags.map((tag, index) => (
        <span 
          key={index} 
          style={{
            fontSize: '0.75rem',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            padding: '0.125rem 0.375rem',
            borderRadius: '0.25rem'
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}