import { useCallback } from 'react';
import { createList } from '../utils/tocModels';

export function useListOperations(board, setBoard) {
  const addIntermediateOutcome = useCallback((name = null) => {
    if (!board?.lists) return;
    const intermediateOutcomeName = name || `Intermediate Outcomes ${board.lists.filter(l => l.type === 'intermediate').length + 1}`;
    const newList = createList(intermediateOutcomeName, '#f59e0b', 0, 'intermediate');
    
    setBoard(prev => {
      if (!prev?.lists) return prev;
      const lists = [...prev.lists];
      
      // Find the index of "Final Outcomes" list
      const finalOutcomesIndex = lists.findIndex(l => l.name === 'Final Outcomes' || l.type === 'fixed' && l.order >= 3);
      const insertIndex = finalOutcomesIndex !== -1 ? finalOutcomesIndex : lists.length - 2;
      
      // Insert the new intermediate outcome list
      lists.splice(insertIndex, 0, newList);
      
      // Reorder all lists
      lists.forEach((list, index) => {
        list.order = index;
      });

      return {
        ...prev,
        lists,
        updatedAt: new Date().toISOString()
      };
    });
    return newList.id;
  }, [board?.lists, setBoard]);

  const updateList = useCallback((listId, updates) => {
    setBoard(prev => {
      if (!prev?.lists) return prev;
      return {
        ...prev,
        lists: prev.lists.map(list => 
          list.id === listId ? { ...list, ...updates } : list
        ),
        updatedAt: new Date().toISOString()
      };
    });
  }, [setBoard]);

  const deleteList = useCallback((listId) => {
    setBoard(prev => {
      if (!prev?.lists || !prev?.nodes || !prev?.edges) return prev;
      const listToDelete = prev.lists.find(l => l.id === listId);
      
      // Prevent deletion of fixed lists
      if (listToDelete && listToDelete.type === 'fixed') {
        alert('Cannot delete core Theory of Change stages.');
        return prev;
      }

      // Remove nodes in this list
      const nodesInList = prev.nodes.filter(node => node.listId === listId);
      const nodeIdsToRemove = nodesInList.map(node => node.id);
      
      const updatedLists = prev.lists.filter(list => list.id !== listId);
      
      // Reorder remaining lists
      updatedLists.forEach((list, index) => {
        list.order = index;
      });

      return {
        ...prev,
        lists: updatedLists,
        nodes: prev.nodes.filter(node => node.listId !== listId),
        edges: prev.edges.filter(edge => 
          !nodeIdsToRemove.includes(edge.sourceId) && !nodeIdsToRemove.includes(edge.targetId)
        ),
        updatedAt: new Date().toISOString()
      };
    });
  }, [setBoard]);

  const reorderLists = useCallback((draggedId, targetId) => {
    setBoard(prev => {
      if (!prev?.lists) return prev;
      const lists = [...prev.lists];
      const draggedIndex = lists.findIndex(l => l.id === draggedId);
      const targetIndex = lists.findIndex(l => l.id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return prev;

      // Remove dragged list and insert at target position
      const [draggedList] = lists.splice(draggedIndex, 1);
      lists.splice(targetIndex, 0, draggedList);

      // Update order values
      lists.forEach((list, index) => {
        list.order = index;
      });

      return {
        ...prev,
        lists,
        updatedAt: new Date().toISOString()
      };
    });
  }, [setBoard]);

  return {
    addIntermediateOutcome,
    updateList,
    deleteList,
    reorderLists
  };
}