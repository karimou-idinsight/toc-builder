import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setActiveId,
  setDragType,
  toggleNodeDraggable
} from '../store/boardSlice';

/**
 * Custom hook for drag and drop operations
 */
export function useDragAndDrop(boardOperations) {
  const dispatch = useDispatch();
  const activeId = useSelector(state => state.board.activeId);
  const dragType = useSelector(state => state.board.dragType);

  const handleDragStart = useCallback((event) => {
    console.log('Drag start:', event.active.id, 'type:', event.active.data.current?.type);
    console.log('Drag start data:', event.active.data.current);
    dispatch(setActiveId(event.active.id));
    dispatch(setDragType(event.active.data.current?.type || 'node'));
  }, [dispatch]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    console.log('Drag end:', active.id, 'over:', over?.id, 'over type:', over?.data?.current?.type);
    
    if (!over) {
      console.log('No drop target, canceling drag');
      dispatch(setActiveId(null));
      dispatch(setDragType(null));
      return;
    }

    if (dragType === 'list') {
      if (active.id !== over.id) {
        boardOperations.reorderLists(active.id, over.id);
      }
    } else if (dragType === 'node') {
      const activeListId = active.data.current?.listId;
      const overListId = over.data.current?.listId || over.id;
      
      console.log('Node drag details:');
      console.log('  activeListId:', activeListId);
      console.log('  overListId:', overListId);
      console.log('  over.data.current:', over.data.current);
      
      if (activeListId && overListId) {
        if (activeListId === overListId) {
          // Reordering within the same list
          console.log('Reordering within same list:', activeListId);
          if (active.id !== over.id) {
            boardOperations.reorderNodes(active.id, over.id, activeListId);
          }
        } else {
          // Moving between different lists
          console.log('Moving node from list', activeListId, 'to list', overListId);
          boardOperations.moveNode(active.id, overListId);
        }
      }
      
      // Exit draggable mode for the moved node
      console.log('Making node non-draggable after move:', active.id);
      dispatch(toggleNodeDraggable({ nodeId: active.id, isDraggable: false }));
    }

    dispatch(setActiveId(null));
    dispatch(setDragType(null));
  }, [dragType, boardOperations, dispatch]);

  return {
    activeId,
    dragType,
    handleDragStart,
    handleDragEnd
  };
}
