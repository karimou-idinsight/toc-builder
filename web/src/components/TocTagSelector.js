'use client';

import React, { useState, useEffect, useRef } from 'react';
import { styles, getTagOptionStyle, getCheckboxStyle, getClearAllButtonStyle } from '../styles/TocTagSelector.styles';

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
    <div ref={dropdownRef} style={styles.container}>
      {/* Input field */}
      <div
        onClick={() => setIsOpen(true)}
        style={styles.inputContainer}
      >
        {selectedTags.length === 0 ? (
          <span style={styles.placeholder}>
            Filter by tags...
          </span>
        ) : (
          <div style={styles.selectedTagsContainer}>
            {selectedTags.map(tag => (
              <span
                key={tag}
                style={styles.selectedTag}
              >
                {tag}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTagToggle(tag);
                  }}
                  style={styles.removeTagButton}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div style={styles.dropdownArrow}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div style={styles.dropdown}>
          {/* Search input */}
          <div style={styles.searchInputContainer}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tags..."
              autoFocus
              style={styles.searchInput}
            />
          </div>

          {/* Tags list */}
          <div style={styles.tagsListContainer}>
            {filteredTags.length === 0 ? (
              <div style={styles.noTagsFound}>
                No tags found
              </div>
            ) : (
              filteredTags.map(tag => (
                <div
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  style={getTagOptionStyle(selectedTags.includes(tag), false)}
                  onMouseEnter={(e) => {
                    if (!selectedTags.includes(tag)) {
                      e.target.style.backgroundColor = styles.tagOptionHover.backgroundColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedTags.includes(tag)) {
                      e.target.style.backgroundColor = styles.tagOptionUnselected.backgroundColor;
                    }
                  }}
                >
                  <div style={getCheckboxStyle(selectedTags.includes(tag))}>
                    {selectedTags.includes(tag) && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                        <path d="M2 6l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    )}
                  </div>
                  <span style={styles.tagText}>{tag}</span>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          {selectedTags.length > 0 && (
            <div style={styles.actionsContainer}>
              <button
                onClick={handleClearAll}
                style={styles.clearAllButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = styles.clearAllButtonHover.backgroundColor;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = styles.clearAllButton.backgroundColor;
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

