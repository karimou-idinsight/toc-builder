'use client';

import React, { useState, useEffect, useRef } from 'react';
// Removed styles import - now using Tailwind CSS classes

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
    <div ref={dropdownRef} className="relative min-w-[250px]">
      {/* Input field */}
      <div
        onClick={() => setIsOpen(true)}
        className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md cursor-pointer min-h-[38px]"
      >
        {selectedTags.length === 0 ? (
          <span className="text-gray-400 text-sm">
            Filter by tags...
          </span>
        ) : (
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white rounded text-xs font-medium"
              >
                {tag}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTagToggle(tag);
                  }}
                  className="bg-none border-none text-white cursor-pointer p-0 text-sm leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="ml-auto text-gray-500">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-dropdown z-[1000] max-h-[300px] overflow-hidden flex flex-col">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tags..."
              autoFocus
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Tags list */}
          <div className="overflow-y-auto max-h-[200px]">
            {filteredTags.length === 0 ? (
              <div className="p-3 text-center text-gray-400 text-sm">
                No tags found
              </div>
            ) : (
              filteredTags.map(tag => (
                <div
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`flex items-center p-2 cursor-pointer border-b border-gray-100 ${
                    selectedTags.includes(tag) 
                      ? 'bg-blue-50' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-4 h-4 mr-2 rounded border-2 flex items-center justify-center ${
                    selectedTags.includes(tag)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {selectedTags.includes(tag) && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                        <path d="M2 6l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-700">{tag}</span>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          {selectedTags.length > 0 && (
            <div className="p-2 border-t border-gray-200">
              <button
                onClick={handleClearAll}
                className="w-full py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors"
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

