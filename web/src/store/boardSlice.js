import { createSlice } from '@reduxjs/toolkit';
import { createBoard } from '../utils/tocModels';

const initialState = {
  board: null,
  linkMode: false,
  linkSource: null,
  activeId: null,
  dragType: null,
  draggableNodes: [],
  causalPathMode: false,
  causalPathNodes: [],
  causalPathFocalNodes: [],
  tagFilterMode: false,
  selectedTags: [],
  tagFilterNodes: [],
};

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    // Initialize board
    initializeBoard: (state, action) => {
      state.board = action.payload || createBoard();
    },

    // Board operations
    updateBoard: (state, action) => {
      if (state.board) {
        state.board = {
          ...state.board,
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
      }
    },

    // List operations
    addList: (state, action) => {
      if (state.board) {
        state.board.lists.push(action.payload);
        state.board.updatedAt = new Date().toISOString();
      }
    },

    updateList: (state, action) => {
      if (state.board) {
        const { listId, updates } = action.payload;
        const listIndex = state.board.lists.findIndex(list => list.id === listId);
        if (listIndex !== -1) {
          state.board.lists[listIndex] = {
            ...state.board.lists[listIndex],
            ...updates
          };
          state.board.updatedAt = new Date().toISOString();
        }
      }
    },

    deleteList: (state, action) => {
      if (state.board) {
        const listId = action.payload;
        state.board.lists = state.board.lists.filter(list => list.id !== listId);
        state.board.nodes = state.board.nodes.filter(node => node.listId !== listId);
        state.board.updatedAt = new Date().toISOString();
      }
    },

    reorderLists: (state, action) => {
      if (state.board) {
        const { draggedId, targetId } = action.payload;
        const lists = [...state.board.lists];
        const draggedIndex = lists.findIndex(list => list.id === draggedId);
        const targetIndex = lists.findIndex(list => list.id === targetId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
          const [draggedList] = lists.splice(draggedIndex, 1);
          lists.splice(targetIndex, 0, draggedList);
          
          lists.forEach((list, index) => {
            list.order = index;
          });
          
          state.board.lists = lists;
          state.board.updatedAt = new Date().toISOString();
        }
      }
    },

    // Node operations
    addNode: (state, action) => {
      if (state.board) {
        state.board.nodes.push(action.payload);
        state.board.updatedAt = new Date().toISOString();
      }
    },

    updateNode: (state, action) => {
      if (state.board) {
        const { nodeId, updates } = action.payload;
        const nodeIndex = state.board.nodes.findIndex(node => node.id === nodeId);
        if (nodeIndex !== -1) {
          state.board.nodes[nodeIndex] = {
            ...state.board.nodes[nodeIndex],
            ...updates,
            updatedAt: new Date().toISOString()
          };
          state.board.updatedAt = new Date().toISOString();
        }
      }
    },

    deleteNode: (state, action) => {
      if (state.board) {
        const nodeId = action.payload;
        state.board.nodes = state.board.nodes.filter(node => node.id !== nodeId);
        state.board.edges = state.board.edges.filter(
          edge => edge.sourceId !== nodeId && edge.targetId !== nodeId
        );
        state.board.updatedAt = new Date().toISOString();
      }
    },

    reorderNodes: (state, action) => {
      if (state.board) {
        const { listId, draggedId, targetId } = action.payload;
        const listNodes = state.board.nodes.filter(node => node.listId === listId);
        const draggedIndex = listNodes.findIndex(node => node.id === draggedId);
        const targetIndex = listNodes.findIndex(node => node.id === targetId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
          const [draggedNode] = listNodes.splice(draggedIndex, 1);
          listNodes.splice(targetIndex, 0, draggedNode);
          
          listNodes.forEach((node, index) => {
            const nodeIndex = state.board.nodes.findIndex(n => n.id === node.id);
            if (nodeIndex !== -1) {
              state.board.nodes[nodeIndex].order = index;
            }
          });
          
          state.board.updatedAt = new Date().toISOString();
        }
      }
    },

    moveNode: (state, action) => {
      if (state.board) {
        const { nodeId, targetListId } = action.payload;
        const nodeIndex = state.board.nodes.findIndex(node => node.id === nodeId);
        
        if (nodeIndex !== -1) {
          state.board.nodes[nodeIndex].listId = targetListId;
          
          const targetListNodes = state.board.nodes.filter(node => node.listId === targetListId);
          targetListNodes.forEach((node, index) => {
            const nIndex = state.board.nodes.findIndex(n => n.id === node.id);
            if (nIndex !== -1) {
              state.board.nodes[nIndex].order = index;
            }
          });
          
          state.board.updatedAt = new Date().toISOString();
        }
      }
    },

    // Edge operations
    addEdge: (state, action) => {
      if (state.board) {
        state.board.edges.push(action.payload);
        state.board.updatedAt = new Date().toISOString();
      }
    },

    updateEdge: (state, action) => {
      if (state.board) {
        const { edgeId, updates } = action.payload;
        const edgeIndex = state.board.edges.findIndex(edge => edge.id === edgeId);
        if (edgeIndex !== -1) {
          state.board.edges[edgeIndex] = {
            ...state.board.edges[edgeIndex],
            ...updates
          };
          state.board.updatedAt = new Date().toISOString();
        }
      }
    },

    deleteEdge: (state, action) => {
      if (state.board) {
        const edgeId = action.payload;
        state.board.edges = state.board.edges.filter(edge => edge.id !== edgeId);
        state.board.updatedAt = new Date().toISOString();
      }
    },

    // UI state
    setLinkMode: (state, action) => {
      state.linkMode = action.payload;
    },

    setLinkSource: (state, action) => {
      state.linkSource = action.payload;
    },

    setActiveId: (state, action) => {
      state.activeId = action.payload;
    },

    setDragType: (state, action) => {
      state.dragType = action.payload;
    },

    setDraggableNodes: (state, action) => {
      state.draggableNodes = action.payload;
    },

    toggleNodeDraggable: (state, action) => {
      const { nodeId, isDraggable } = action.payload;
      console.log('Redux toggleNodeDraggable:', nodeId, 'isDraggable:', isDraggable);
      if (isDraggable) {
        if (!state.draggableNodes.includes(nodeId)) {
          state.draggableNodes.push(nodeId);
          console.log('Added to draggable nodes:', state.draggableNodes);
        }
      } else {
        state.draggableNodes = state.draggableNodes.filter(id => id !== nodeId);
        console.log('Removed from draggable nodes:', state.draggableNodes);
      }
    },

    setCausalPathMode: (state, action) => {
      state.causalPathMode = action.payload;
    },

    setCausalPathNodes: (state, action) => {
      state.causalPathNodes = action.payload;
    },

    // Focal nodes (multiple supported)
    setCausalPathFocalNode: (state, action) => {
      // Backward compatibility: set single focal node -> replace with single-item array
      state.causalPathFocalNodes = typeof action.payload === 'undefined' || action.payload === null
        ? []
        : [action.payload];
    },
    setCausalPathFocalNodes: (state, action) => {
      state.causalPathFocalNodes = Array.isArray(action.payload) ? action.payload : [];
    },
    addCausalPathFocalNode: (state, action) => {
      const nodeId = action.payload;
      if (nodeId == null) return;
      if (!state.causalPathFocalNodes.includes(nodeId)) {
        state.causalPathFocalNodes.push(nodeId);
      }
    },
    removeCausalPathFocalNode: (state, action) => {
      const nodeId = action.payload;
      state.causalPathFocalNodes = state.causalPathFocalNodes.filter(id => id !== nodeId);
    },

    clearCausalPath: (state) => {
      state.causalPathNodes = [];
      state.causalPathFocalNodes = [];
      state.causalPathMode = false;
    },

    // Tag filter operations
    setSelectedTags: (state, action) => {
      state.selectedTags = action.payload;
    },

    setTagFilterMode: (state, action) => {
      state.tagFilterMode = action.payload;
    },

    setTagFilterNodes: (state, action) => {
      state.tagFilterNodes = action.payload;
    },

    clearTagFilter: (state) => {
      state.selectedTags = [];
      state.tagFilterNodes = [];
      state.tagFilterMode = false;
    }
  }
});

export const {
  initializeBoard,
  updateBoard,
  addList,
  updateList,
  deleteList,
  reorderLists,
  addNode,
  updateNode,
  deleteNode,
  reorderNodes,
  moveNode,
  addEdge,
  updateEdge,
  deleteEdge,
  setLinkMode,
  setLinkSource,
  setActiveId,
  setDragType,
  setDraggableNodes,
  toggleNodeDraggable,
  setCausalPathMode,
  setCausalPathNodes,
  setCausalPathFocalNode,
  setCausalPathFocalNodes,
  addCausalPathFocalNode,
  removeCausalPathFocalNode,
  clearCausalPath,
  setSelectedTags,
  setTagFilterMode,
  setTagFilterNodes,
  clearTagFilter
} = boardSlice.actions;

export default boardSlice.reducer;

