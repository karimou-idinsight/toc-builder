'use client';

import React, { useState, useEffect, useRef } from 'react';
// Removed styles import - now using Tailwind CSS classes

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
    <div ref={dropdownRef} className="relative w-full">
      {/* Input container with selected tags */}
      <div
        className="flex flex-wrap gap-1 items-center px-2 py-1.5 bg-white border border-gray-300 rounded-md min-h-[38px] cursor-text"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {/* Selected tags */}
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white rounded text-xs font-medium"
          >
            {tag}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag);
              }}
              className="bg-none border-none text-white cursor-pointer p-0 text-sm leading-none font-bold"
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
          className="flex-1 min-w-[100px] border-none outline-none text-sm bg-transparent"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (searchTerm || filteredTags.length > 0 || isNewTag) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-dropdown z-[1000] max-h-[250px] overflow-hidden flex flex-col">
          <div className="overflow-y-auto max-h-[250px]">
            {/* Create new tag option */}
            {isNewTag && (
              <div
                onClick={() => handleAddTag(searchTerm.trim())}
                className="flex items-center p-2.5 cursor-pointer bg-blue-50 border-b border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <div className="w-5 h-5 mr-2 bg-blue-500 rounded flex items-center justify-center text-white text-base font-bold">
                  +
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-700">
                    Create "{searchTerm.trim()}"
                  </div>
                  <div className="text-xs text-gray-500">
                    Press Enter or click to create new tag
                  </div>
                </div>
              </div>
            )}

            {/* Existing tags */}
            {filteredTags.length > 0 && (
              <>
                {isNewTag && (
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    Existing Tags
                  </div>
                )}
                {filteredTags.map(tag => (
                  <div
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className="flex items-center p-2 cursor-pointer bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 mr-2.5 bg-blue-500 rounded-full" />
                    <span className="text-sm text-gray-700">{tag}</span>
                  </div>
                ))}
              </>
            )}

            {/* No results */}
            {!isNewTag && filteredTags.length === 0 && searchTerm && (
              <div className="p-3 text-center text-gray-400 text-sm">
                No matching tags found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

