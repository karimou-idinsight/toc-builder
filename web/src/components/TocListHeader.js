'use client';

import { useSelector } from 'react-redux';
import { tocListHeaderStyles } from '../styles/TocListHeader.styles';
import { LIST_TYPES } from '../utils/tocModels';
import { selectCanEdit } from '../store/selectors';

export default function TocListHeader({
  list,
  nodesCount,
  isEditingTitle,
  editTitle,
  setIsEditingTitle,
  setEditTitle,
  handleTitleEdit,
  hoveredButton,
  setHoveredButton,
  listeners,
  attributes,
  onSettingsClick,
  onDeleteList,
  isDragging,
}) {
  const canEdit = useSelector(selectCanEdit);
  return (
    <div style={tocListHeaderStyles.container}>
      {/* Draggable header area */}
      <div
        style={{
          ...tocListHeaderStyles.draggableArea,
          ...(isDragging ? tocListHeaderStyles.draggableAreaActive : {}),
        }}
        {...listeners}
        {...attributes}
      >
        {isEditingTitle ? (
          <form onSubmit={handleTitleEdit} style={tocListHeaderStyles.titleForm}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleEdit}
              autoFocus
              style={tocListHeaderStyles.titleInput}
            />
          </form>
        ) : (
          <h3
            style={{
              ...tocListHeaderStyles.title,
              borderLeft: `4px solid ${list.color || '#3b82f6'}`,
              cursor: canEdit ? 'pointer' : 'default',
            }}
            onClick={() => canEdit && setIsEditingTitle(true)}
          >
            {list.name}
          </h3>
        )}
      </div>

      {/* Non-draggable buttons positioned absolutely */}
      <div style={tocListHeaderStyles.buttonsContainer}>
        <span style={tocListHeaderStyles.nodeCount}>
          {nodesCount}
        </span>

        {canEdit && (
          <button
            style={{
              ...tocListHeaderStyles.settingsButton,
              ...(hoveredButton === 'settings' ? tocListHeaderStyles.settingsButtonHover : {}),
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onSettingsClick(e);
            }}
            onMouseEnter={() => setHoveredButton('settings')}
            onMouseLeave={() => setHoveredButton(null)}
            title="List settings"
          >
            ⚙️
          </button>
        )}

        {canEdit && (list.type !== LIST_TYPES.FIXED) && (
          <button
            style={{
              ...tocListHeaderStyles.deleteButton,
              ...(hoveredButton === 'delete' ? tocListHeaderStyles.deleteButtonHover : {})
            }}
            onClick={() => {
              if (confirm(`Delete "${list.name}" and all its nodes?`)) onDeleteList(list.id);
            }}
            onMouseEnter={() => setHoveredButton('delete')}
            onMouseLeave={() => setHoveredButton(null)}
            title='Delete list'
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}