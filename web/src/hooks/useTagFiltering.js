import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  setSelectedTags,
  setTagFilterMode,
  setTagFilterNodes,
  clearTagFilter
} from '../store/boardSlice';
import {
  selectSelectedTags,
  selectTagFilterMode,
  selectTagFilterNodesSet,
  selectAllNodes
} from '../store/selectors';

/**
 * Custom hook for tag filtering operations
 */
export function useTagFiltering(getAllConnectedNodes, boardId) {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const selectedTags = useSelector(selectSelectedTags);
  const tagFilterMode = useSelector(selectTagFilterMode);
  const tagFilterNodes = useSelector(selectTagFilterNodesSet);
  const allNodes = useSelector(selectAllNodes);
  const hasInitializedFromUrl = useRef(false);
  const lastBoardId = useRef(boardId);

  // Get all unique tags from all nodes
  const getAllTags = useCallback(() => {
    const tagsSet = new Set();
    allNodes.forEach(node => {
      if (node.tags && Array.isArray(node.tags)) {
        node.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  }, [allNodes]);

  // Reset initialization flag when board changes
  useEffect(() => {
    if (lastBoardId.current !== boardId) {
      hasInitializedFromUrl.current = false;
      lastBoardId.current = boardId;
    }
  }, [boardId]);

  // Initialize tags from URL when nodes are available
  useEffect(() => {
    if (hasInitializedFromUrl.current || allNodes.length === 0) return;
    
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      let tagsFromUrl = [];
      if (typeof tagsParam === 'string') {
        tagsFromUrl = tagsParam.split('|').filter(tag => tag.length > 0);
      }
      if (tagsFromUrl.length > 0) {
        dispatch(setSelectedTags(tagsFromUrl));
        // Apply filter immediately
        const nodesWithTags = new Set();
        allNodes.forEach(node => {
          if (node.tags && node.tags.some(tag => tagsFromUrl.includes(tag))) {
            nodesWithTags.add(node.id);
            const connectedNodes = getAllConnectedNodes(node.id);
            connectedNodes.forEach(nodeId => nodesWithTags.add(nodeId));
          }
        });
        dispatch(setTagFilterNodes(Array.from(nodesWithTags)));
        dispatch(setTagFilterMode(true));
      }
    }
    hasInitializedFromUrl.current = true;
  }, [searchParams, dispatch, allNodes, getAllConnectedNodes]);

  // Handle tag selection changes
  const handleTagsChange = useCallback((tags, boardInnerRef) => {
    dispatch(setSelectedTags(tags));
    
    // Update URL with selected tags (pipe-separated)
    const params = new URLSearchParams(searchParams);
    if (tags.length === 0) {
      params.delete('tags');
    } else {
      // Join tags with pipe separator: "Education|Health|Agriculture"
      params.set('tags', tags.join('|'));
    }
    
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl);
    
    if (tags.length === 0) {
      dispatch(clearTagFilter());
      return;
    }

    // Find all nodes with selected tags
    const nodesWithTags = new Set();
    allNodes.forEach(node => {
      if (node.tags && node.tags.some(tag => tags.includes(tag))) {
        nodesWithTags.add(node.id);
        
        // Add all connected nodes (causal path)
        const connectedNodes = getAllConnectedNodes(node.id);
        connectedNodes.forEach(nodeId => nodesWithTags.add(nodeId));
      }
    });

    dispatch(setTagFilterNodes(Array.from(nodesWithTags)));
    dispatch(setTagFilterMode(true));
    
    // Scroll to top when entering tag filter mode
    setTimeout(() => {
      if (boardInnerRef.current) {
        boardInnerRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    }, 0);
  }, [allNodes, getAllConnectedNodes, dispatch, router, searchParams, pathname]);

  return {
    selectedTags,
    tagFilterMode,
    tagFilterNodes,
    getAllTags,
    handleTagsChange
  };
}
