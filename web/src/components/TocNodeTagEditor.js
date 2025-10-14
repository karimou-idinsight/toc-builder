'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function TocNodeTagEditor({ tags = [], allTags = [], onTagsChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

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

  // Filter existing tags that match search term and aren't already selected
  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !tags.includes(tag)
  );

  // Check if search term is a new tag
  const isNewTag = searchTerm.trim() && 
    !allTags.some(tag => tag.toLowerCase() === searchTerm.trim().toLowerCase()) &&
    !tags.includes(searchTerm.trim());

  const handleAddTag = (tag) => {
    if (!tags.includes(tag)) {
      onTagsChange([...tags, tag]);
    }
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagToRemove) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && isNewTag) {
      e.preventDefault();
      handleAddTag(searchTerm.trim());
    } else if (e.key === 'Backspace' && !searchTerm && tags.length > 0) {
      // Remove last tag on backspace when input is empty
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input container with selected tags */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          alignItems: 'center',
          padding: '6px 8px',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          minHeight: '38px',
          cursor: 'text',
        }}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {/* Selected tags */}
        {tags.map(tag => (
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
                handleRemoveTag(tag);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0',
                fontSize: '14px',
                lineHeight: '1',
                fontWeight: 'bold',
              }}
            >
              ×
            </button>
          </span>
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Add tags..." : ""}
          style={{
            flex: 1,
            minWidth: '100px',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            backgroundColor: 'transparent',
          }}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (searchTerm || filteredTags.length > 0 || isNewTag) && (
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
            maxHeight: '250px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
            {/* Create new tag option */}
            {isNewTag && (
              <div
                onClick={() => handleAddTag(searchTerm.trim())}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  backgroundColor: '#f0f9ff',
                  borderBottom: '1px solid #e0f2fe',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e0f2fe';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f0f9ff';
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '8px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  +
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e40af' }}>
                    Create "{searchTerm.trim()}"
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Press Enter or click to create new tag
                  </div>
                </div>
              </div>
            )}

            {/* Existing tags */}
            {filteredTags.length > 0 && (
              <>
                {isNewTag && (
                  <div style={{ 
                    padding: '6px 12px', 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    Existing Tags
                  </div>
                )}
                {filteredTags.map(tag => (
                  <div
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      borderBottom: '1px solid #f3f4f6',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                    }}
                  >
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        marginRight: '10px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%',
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#374151' }}>{tag}</span>
                  </div>
                ))}
              </>
            )}

            {/* No results */}
            {!isNewTag && filteredTags.length === 0 && searchTerm && (
              <div style={{ padding: '12px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                No matching tags found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

