'use client';

import React, { useState, useEffect, useRef } from 'react';
import { styles, getCreateNewTagOptionStyle, getExistingTagOptionStyle } from '../styles/TocNodeTagEditor.styles';

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
    <div ref={dropdownRef} style={styles.container}>
      {/* Input container with selected tags */}
      <div
        style={styles.inputContainer}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {/* Selected tags */}
        {tags.map(tag => (
          <span
            key={tag}
            style={styles.selectedTag}
          >
            {tag}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag);
              }}
              style={styles.removeTagButton}
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
          style={styles.input}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (searchTerm || filteredTags.length > 0 || isNewTag) && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownContent}>
            {/* Create new tag option */}
            {isNewTag && (
              <div
                onClick={() => handleAddTag(searchTerm.trim())}
                style={styles.createNewTagOption}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = styles.createNewTagOptionHover.backgroundColor;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = styles.createNewTagOption.backgroundColor;
                }}
              >
                <div style={styles.createNewTagIcon}>
                  +
                </div>
                <div>
                  <div style={styles.createNewTagText}>
                    Create "{searchTerm.trim()}"
                  </div>
                  <div style={styles.createNewTagSubtext}>
                    Press Enter or click to create new tag
                  </div>
                </div>
              </div>
            )}

            {/* Existing tags */}
            {filteredTags.length > 0 && (
              <>
                {isNewTag && (
                  <div style={styles.existingTagsSection}>
                    Existing Tags
                  </div>
                )}
                {filteredTags.map(tag => (
                  <div
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    style={styles.existingTagOption}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = styles.existingTagOptionHover.backgroundColor;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = styles.existingTagOption.backgroundColor;
                    }}
                  >
                    <div style={styles.existingTagIndicator} />
                    <span style={styles.existingTagText}>{tag}</span>
                  </div>
                ))}
              </>
            )}

            {/* No results */}
            {!isNewTag && filteredTags.length === 0 && searchTerm && (
              <div style={styles.noResults}>
                No matching tags found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

