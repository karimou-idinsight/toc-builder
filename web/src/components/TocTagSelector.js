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
    <div ref={dropdownRef} className="relative w-full">
      {/* Input field */}
      <div
        onClick={() => setIsOpen(true)}
        className="flex items-center px-3 py-2.5 bg-white border-2 border-blue-300 rounded-lg cursor-pointer min-h-[42px] shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
        style={{
          backgroundColor: selectedTags.length > 0 ? '#eff6ff' : 'white'
        }}
      >
        {selectedTags.length === 0 ? (
          <span className="text-gray-500 text-sm font-medium">
            Click to select...
          </span>
        ) : (
          <div className="flex flex-wrap gap-1.5 flex-1">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500 text-white rounded-md text-xs font-semibold shadow-sm"
              >
                {tag}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTagToggle(tag);
                  }}
                  className="bg-none border-none text-white cursor-pointer p-0 text-base leading-none hover:text-blue-100"
                  title="Remove tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="ml-auto text-blue-500 flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-300 rounded-lg shadow-xl z-[1000] max-h-[350px] overflow-hidden flex flex-col">
          {/* Search input */}
          <div className="p-3 border-b-2 border-gray-200 bg-blue-50">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Search tags..."
              autoFocus
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Tags list */}
          <div className="overflow-y-auto max-h-[220px]">
            {filteredTags.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                No tags found
              </div>
            ) : (
              filteredTags.map(tag => (
                <div
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`flex items-center p-3 cursor-pointer border-b border-gray-100 transition-colors ${
                    selectedTags.includes(tag) 
                      ? 'bg-blue-50 hover:bg-blue-100' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 mr-3 rounded border-2 flex items-center justify-center transition-all ${
                    selectedTags.includes(tag)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {selectedTags.includes(tag) && (
                      <svg width="14" height="14" viewBox="0 0 12 12" fill="white">
                        <path d="M2 6l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${selectedTags.includes(tag) ? 'text-blue-700 font-semibold' : 'text-gray-700'}`}>{tag}</span>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          {selectedTags.length > 0 && (
            <div className="p-3 border-t-2 border-gray-200 bg-gray-50">
              <button
                onClick={handleClearAll}
                className="w-full py-2 text-sm font-semibold text-red-600 bg-white border-2 border-red-200 rounded-lg cursor-pointer hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

