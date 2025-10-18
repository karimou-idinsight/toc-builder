import { useSelector } from 'react-redux';
import {
  selectBoard,
  selectLinkMode,
  selectLinkSource,
  selectDraggableNodesSet,
  selectAllNodes,
  selectAllEdges
} from '../store/selectors';

/**
 * Custom hook to consolidate all board-related state selectors
 */
export function useBoardState() {
  const board = useSelector(selectBoard);
  const linkMode = useSelector(selectLinkMode);
  const linkSource = useSelector(selectLinkSource);
  const draggableNodes = useSelector(selectDraggableNodesSet);
  const allNodes = useSelector(selectAllNodes);
  const allEdges = useSelector(selectAllEdges);
  const activeId = useSelector(state => state.board.activeId);
  const dragType = useSelector(state => state.board.dragType);

  return {
    board,
    linkMode,
    linkSource,
    draggableNodes,
    allNodes,
    allEdges,
    activeId,
    dragType
  };
}
