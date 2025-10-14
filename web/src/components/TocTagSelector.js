'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function TocTagSelector({ allTags, selectedTags, onTagsChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleClearAll = () => {
    onTagsChange([]);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', minWidth: '250px' }}>
      {/* Input field */}
      <div
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: 'pointer',
          minHeight: '38px',
        }}
      >
        {selectedTags.length === 0 ? (
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>
            Filter by tags...
          </span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', flex: 1 }}>
            {selectedTags.map(tag => (
              <span
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                }}
              >
                {tag}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTagToggle(tag);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '0',
                    fontSize: '14px',
                    lineHeight: '1',
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div style={{ marginLeft: 'auto', color: '#6b7280' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 1000,
            maxHeight: '300px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Search input */}
          <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tags..."
              autoFocus
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Tags list */}
          <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
            {filteredTags.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                No tags found
              </div>
            ) : (
              filteredTags.map(tag => (
                <div
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: selectedTags.includes(tag) ? '#eff6ff' : 'white',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedTags.includes(tag)) {
                      e.target.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedTags.includes(tag)) {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      marginRight: '8px',
                      border: `2px solid ${selectedTags.includes(tag) ? '#3b82f6' : '#d1d5db'}`,
                      borderRadius: '3px',
                      backgroundColor: selectedTags.includes(tag) ? '#3b82f6' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selectedTags.includes(tag) && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                        <path d="M2 6l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: '14px', color: '#374151' }}>{tag}</span>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          {selectedTags.length > 0 && (
            <div style={{ padding: '8px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={handleClearAll}
                style={{
                  width: '100%',
                  padding: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#6b7280',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

