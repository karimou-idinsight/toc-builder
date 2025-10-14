'use client';

import React, { useState } from 'react';
import { Dialog, Transition, DialogPanel, DialogTitle } from '@headlessui/react';
import { tocListSettingsModalStyles } from '../styles/TocListSettingsModal.styles';
import { LIST_TYPES } from '../utils/tocModels';

export default function TocListSettingsModal({
  isModalOpen,
  setIsModalOpen,
  list,
  colors,
  handleColorChange,
  onUpdateList,
  onDeleteList,
  hoveredButton,
  setHoveredButton,
  hoveredColor,
  setHoveredColor,
}) {
  const [editName, setEditName] = useState(list?.name || '');

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isModalOpen && list) {
      setEditName(list.name);
    }
  }, [isModalOpen, list]);

  const handleSave = () => {
    if (editName.trim() && onUpdateList) {
      onUpdateList(list.id, {
        name: editName.trim()
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (list.type !== LIST_TYPES.INTERMEDIATE) {
      alert('Only intermediate outcome lists can be deleted.');
      return;
    }
    if (confirm(`Delete "${list.name}" and all its nodes?`)) {
      onDeleteList(list.id);
      setIsModalOpen(false);
    }
  };

  return (
    <Transition show={isModalOpen}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => setIsModalOpen(false)}>
        <div className="fixed inset-0 bg-black/25" style={tocListSettingsModalStyles.overlay} />
        <div style={tocListSettingsModalStyles.container}>
          <div style={tocListSettingsModalStyles.wrapper}>

              <DialogPanel style={tocListSettingsModalStyles.modal}>
                <div style={tocListSettingsModalStyles.header}>
                  <DialogTitle as="h3" style={tocListSettingsModalStyles.title}>
                    List Settings
                  </DialogTitle>
                  <button
                    style={{
                      ...tocListSettingsModalStyles.closeButton,
                      ...(hoveredButton === 'close' ? tocListSettingsModalStyles.closeButtonHover : {}),
                    }}
                    onClick={() => setIsModalOpen(false)}
                    onMouseEnter={() => setHoveredButton('close')}
                    onMouseLeave={() => setHoveredButton(null)}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                <div style={tocListSettingsModalStyles.content}>
                  {/* List Name Section */}
                  <div style={tocListSettingsModalStyles.section}>
                    <label style={tocListSettingsModalStyles.label}>List Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={tocListSettingsModalStyles.textInput}
                      placeholder="Enter list name..."
                    />
                  </div>

                  {/* Color Picker Section */}
                  <div style={tocListSettingsModalStyles.section}>
                    <label style={tocListSettingsModalStyles.label}>List Color</label>
                    <div style={tocListSettingsModalStyles.colorPicker}>
                      {colors.map(color => (
                        <button
                          key={color}
                          style={{
                            ...tocListSettingsModalStyles.colorOption,
                            backgroundColor: color,
                            ...(list.color === color ? tocListSettingsModalStyles.colorOptionActive : {}),
                            ...(hoveredColor === color ? tocListSettingsModalStyles.colorOptionHover : {}),
                          }}
                          onClick={() => handleColorChange(color)}
                          onMouseEnter={() => setHoveredColor(color)}
                          onMouseLeave={() => setHoveredColor(null)}
                          title={`Change to ${color}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={tocListSettingsModalStyles.actions}>
                    <button
                      style={{
                        ...tocListSettingsModalStyles.saveButton,
                        ...(hoveredButton === 'save' ? tocListSettingsModalStyles.saveButtonHover : {}),
                      }}
                      onClick={handleSave}
                      onMouseEnter={() => setHoveredButton('save')}
                      onMouseLeave={() => setHoveredButton(null)}
                    >
                      Save Changes
                    </button>
                    
                    {list?.type === LIST_TYPES.INTERMEDIATE && (
                      <button
                        style={{
                          ...tocListSettingsModalStyles.deleteButton,
                          ...(hoveredButton === 'deleteList' ? tocListSettingsModalStyles.deleteButtonHover : {}),
                        }}
                        onClick={handleDelete}
                        onMouseEnter={() => setHoveredButton('deleteList')}
                        onMouseLeave={() => setHoveredButton(null)}
                      >
                        Delete List
                      </button>
                    )}
                    
                    <button
                      style={{
                        ...tocListSettingsModalStyles.cancelButton,
                        ...(hoveredButton === 'cancel' ? tocListSettingsModalStyles.cancelButtonHover : {}),
                      }}
                      onClick={() => setIsModalOpen(false)}
                      onMouseEnter={() => setHoveredButton('cancel')}
                      onMouseLeave={() => setHoveredButton(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </DialogPanel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}