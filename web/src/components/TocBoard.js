'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import TocToolbar from './TocToolbar';
import TocEdgesLegend from './TocEdgesLegend';
import TocBoardContent from './TocBoardContent';
import { TocBoardLoading, TocBoardError, TocBoardInitializing } from './TocBoardLoading';
import { createBoard } from '../utils/tocModels';
import { boardsApi } from '../utils/boardsApi';
import { transformBoardData } from '../utils/boardTransformer';
import { tocBoardStyles } from '../styles/TocBoard.styles';
import { useLoading } from '../context/LoadingContext';
import { initializeBoard, setLinkMode, setLinkSource } from '../store/boardSlice';
import { useBoardState } from '../hooks/useBoardState';
import { useBoardOperations } from '../hooks/useBoardOperations';
import { useCausalPath } from '../hooks/useCausalPath';
import { useTagFiltering } from '../hooks/useTagFiltering';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { getConnectedNodes } from '../utils/nodeUtils';

export default function TocBoard({ boardId = 'default' }) {
  const dispatch = useDispatch();
  const boardInnerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { startLoading, stopLoading } = useLoading();
  
  // Use custom hooks for state management
  const boardState = useBoardState();
  const boardOperations = useBoardOperations();
  const causalPath = useCausalPath(boardInnerRef);
  const tagFiltering = useTagFiltering(causalPath.getAllConnectedNodes, boardId);
  const dragAndDrop = useDragAndDrop(boardOperations);


  // Load board data effect
  useEffect(() => {
    async function loadBoard() {
      try {
        setLoading(true);
        setError(null);
        startLoading();

        if (!boardId || boardId === 'default') {
          const initialBoard = createBoard();
          dispatch(initializeBoard(initialBoard));
        } else {
          const backendData = await boardsApi.getBoardData(boardId);
          const transformedBoard = transformBoardData(backendData);
          dispatch(initializeBoard(transformedBoard));
        }
      } catch (err) {
        setError(err.message || 'Failed to load board');
      } finally {
        setLoading(false);
        stopLoading();
      }
    }

    loadBoard();
  }, [boardId, dispatch, startLoading, stopLoading]);

  // Event handlers
  const startLinkMode = useCallback(() => {
    dispatch(setLinkMode(true));
    dispatch(setLinkSource(null));
  }, [dispatch]);

  const exitLinkMode = useCallback(() => {
    dispatch(setLinkMode(false));
    dispatch(setLinkSource(null));
  }, [dispatch]);

  const handleNodeClick = useCallback((nodeId) => {
    if (boardState.linkMode) {
      if (!boardState.linkSource) {
        dispatch(setLinkSource(nodeId));
      } else if (boardState.linkSource !== nodeId) {
        boardOperations.addEdge(boardState.linkSource, nodeId);
        dispatch(setLinkSource(null));
        dispatch(setLinkMode(false));
      }
    }
  }, [boardState.linkMode, boardState.linkSource, boardOperations, dispatch]);

  const handleNodeStartLinking = useCallback((nodeId) => {
    dispatch(setLinkMode(true));
    dispatch(setLinkSource(nodeId));
  }, [dispatch]);

  // Additional event handlers
  const handleAddIntermediateOutcome = () => {
    const name = prompt('Enter intermediate outcome name:');
    if (name) {
      boardOperations.addIntermediateOutcome(name);
    } else if (name === '') {
      boardOperations.addIntermediateOutcome();
    }
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      if (window.getSelection) {
        try { window.getSelection().removeAllRanges(); } catch (_) {}
      }
      if (boardState.linkMode) {
        exitLinkMode();
      }
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Show loading state
  if (loading) {
    return <TocBoardLoading />;
  }

  // Show error state
  if (error) {
    return <TocBoardError error={error} onRetry={handleRetry} />;
  }

  // Show loading state if board is not ready
  if (!boardState.board) {
    return <TocBoardInitializing />;
  }

  return (
    <div style={tocBoardStyles.container} onClick={handleBackgroundClick}>
      <TocToolbar
        linkMode={boardState.linkMode}
        onStartLinkMode={startLinkMode}
        onExitLinkMode={exitLinkMode}
        onAddIntermediateOutcome={handleAddIntermediateOutcome}
        selectedTags={tagFiltering.selectedTags}
        onTagsChange={(tags) => tagFiltering.handleTagsChange(tags, boardInnerRef)}
        allTags={tagFiltering.getAllTags()}
        boardId={boardId}
        onExitCausalMode={() => causalPath.exitCausalPathMode()}
        showExitCausal={Boolean(causalPath.causalPathMode && Array.isArray(causalPath.causalPathFocalNodes) && causalPath.causalPathFocalNodes.length > 0)}
      />

      <div style={tocBoardStyles.content}>
        <TocBoardContent
          board={boardState.board}
          boardInnerRef={boardInnerRef}
          boardOperations={{
            ...boardOperations,
            handleNodeClick,
            handleNodeStartLinking,
            getConnectedNodes: (nodeId) => getConnectedNodes(nodeId, boardState.allEdges, boardState.allNodes)
          }}
          causalPath={causalPath}
          tagFiltering={tagFiltering}
          dragAndDrop={dragAndDrop}
          allNodes={boardState.allNodes}
          allEdges={boardState.allEdges}
        />
      </div>
      
      {/* Fixed legend that doesn't scroll with content */}
      <TocEdgesLegend visible={boardState.allEdges.length > 0} />
    </div>
  );
}