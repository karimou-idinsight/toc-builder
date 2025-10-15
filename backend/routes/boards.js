import express from 'express';
import Board from '../models/Board.js';
import BoardPermission from '../models/BoardPermission.js';
import BoardInvitation from '../models/BoardInvitation.js';
import BoardList from '../models/BoardList.js';
import BoardNode from '../models/BoardNode.js';
import BoardEdge from '../models/BoardEdge.js';
import BoardNodeComment from '../models/BoardNodeComment.js';
import BoardEdgeComment from '../models/BoardEdgeComment.js';
import { 
  authenticateToken, 
  requireBoardOwner,
  requireBoardContributor,
  requireBoardViewer,
  requireEmailVerification,
  rateLimit 
} from '../middleware/auth.js';

const router = express.Router();

// Get all boards user has access to
router.get('/', authenticateToken, async (req, res) => {
  try {
    const boards = await Board.findByUserAccess(req.user.id);
    res.json({ boards });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Failed to get boards' });
  }
});

// Get public boards
router.get('/public', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const boards = await Board.findPublic(parseInt(limit), parseInt(offset));
    res.json({ boards });
  } catch (error) {
    console.error('Get public boards error:', error);
    res.status(500).json({ error: 'Failed to get public boards' });
  }
});

// Create new board
router.post('/', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const { title, description, is_public = false, settings = {} } = req.body;
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Board title is required' });
    }
    
    const board = await Board.create({
      title: title.trim(),
      description: description?.trim(),
      owner_id: req.user.id,
      is_public,
      settings
    });
    
    res.status(201).json({
      message: 'Board created successfully',
      board: board.toJSON()
    });
    
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// Get full board data (board + lists + nodes + edges) - MUST come before /:boardId
router.get('/:boardId/data', authenticateToken, requireBoardViewer, async (req, res) => {
  try {
    // req.board is set by requireBoardViewer middleware
    const boardData = await req.board.getFullBoardData();
    
    if (!boardData) {
      return res.status(404).json({ error: 'Board data not found' });
    }
    
    res.json(boardData);
  } catch (error) {
    console.error('Get board data error:', error);
    res.status(500).json({ error: 'Failed to get board data' });
  }
});

// Get specific board
router.get('/:boardId', authenticateToken, requireBoardViewer, async (req, res) => {
  try {
    const board = await req.board.withOwner();
    res.json({ board });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Failed to get board' });
  }
});

// Update board
router.put('/:boardId', authenticateToken, requireBoardContributor, async (req, res) => {
  try {
    const { title, description, is_public, settings } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (is_public !== undefined) updateData.is_public = is_public;
    if (settings !== undefined) updateData.settings = settings;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const updatedBoard = await req.board.update(updateData);
    
    res.json({
      message: 'Board updated successfully',
      board: updatedBoard.toJSON()
    });
    
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
});

// Delete board
router.delete('/:boardId', authenticateToken, requireBoardOwner, async (req, res) => {
  try {
    await req.board.delete();
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

// Get board permissions
router.get('/:boardId/permissions', authenticateToken, requireBoardViewer, async (req, res) => {
  try {
    const permissions = await req.board.getPermissions();
    res.json({ permissions });
  } catch (error) {
    console.error('Get board permissions error:', error);
    res.status(500).json({ error: 'Failed to get board permissions' });
  }
});

// Add user to board
router.post('/:boardId/permissions', authenticateToken, requireBoardOwner, async (req, res) => {
  try {
    const { user_id, role } = req.body;
    
    if (!user_id || !role) {
      return res.status(400).json({ error: 'User ID and role are required' });
    }
    
    if (!['contributor', 'reviewer', 'viewer'].includes(role)) {
      return res.status(400).json({ 
        error: 'Role must be contributor, reviewer, or viewer' 
      });
    }
    
    // Check if user exists
    const { default: User } = await import('../models/User.js');
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if permission already exists
    const existingPermission = await BoardPermission.findByBoardAndUser(req.board.id, user_id);
    if (existingPermission) {
      return res.status(409).json({ error: 'User already has permission on this board' });
    }
    
    const permission = await BoardPermission.create({
      board_id: req.board.id,
      user_id,
      role,
      granted_by: req.user.id
    });
    
    res.status(201).json({
      message: 'Permission added successfully',
      permission: permission.toJSON()
    });
    
  } catch (error) {
    console.error('Add board permission error:', error);
    res.status(500).json({ error: 'Failed to add board permission' });
  }
});

// Update user permission on board
router.put('/:boardId/permissions/:userId', authenticateToken, requireBoardOwner, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!role || !['contributor', 'reviewer', 'viewer'].includes(role)) {
      return res.status(400).json({ 
        error: 'Valid role is required (contributor, reviewer, or viewer)' 
      });
    }
    
    const permission = await BoardPermission.findByBoardAndUser(req.board.id, userId);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    
    const updatedPermission = await permission.updateRole(role, req.user.id);
    
    res.json({
      message: 'Permission updated successfully',
      permission: updatedPermission.toJSON()
    });
    
  } catch (error) {
    console.error('Update board permission error:', error);
    res.status(500).json({ error: 'Failed to update board permission' });
  }
});

// Remove user from board
router.delete('/:boardId/permissions/:userId', authenticateToken, requireBoardOwner, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const deleted = await BoardPermission.deleteByBoardAndUser(req.board.id, userId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    
    res.json({ message: 'Permission removed successfully' });
    
  } catch (error) {
    console.error('Remove board permission error:', error);
    res.status(500).json({ error: 'Failed to remove board permission' });
  }
});

// Invite user to board
router.post('/:boardId/invite', authenticateToken, requireBoardContributor, async (req, res) => {
  try {
    const { email, role } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }
    
    if (!['contributor', 'reviewer', 'viewer'].includes(role)) {
      return res.status(400).json({ 
        error: 'Role must be contributor, reviewer, or viewer' 
      });
    }
    
    // Check if invitation already exists
    const existingInvitation = await BoardInvitation.existsForEmailAndBoard(email, req.board.id);
    if (existingInvitation) {
      return res.status(409).json({ error: 'User already has a pending invitation' });
    }
    
    // Check if user already has permission
    const { default: User } = await import('../models/User.js');
    const user = await User.findByEmail(email);
    if (user) {
      const existingPermission = await BoardPermission.findByBoardAndUser(req.board.id, user.id);
      if (existingPermission) {
        return res.status(409).json({ error: 'User already has access to this board' });
      }
    }
    
    const invitation = await BoardInvitation.create({
      board_id: req.board.id,
      email,
      role,
      invited_by: req.user.id
    });
    
    // In a real application, you would send an email here
    console.log(`Board invitation for ${email}: ${invitation.token}`);
    
    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation: invitation.toJSON()
    });
    
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Get board invitations
router.get('/:boardId/invitations', authenticateToken, requireBoardViewer, async (req, res) => {
  try {
    const invitations = await BoardInvitation.findByBoard(req.board.id);
    res.json({ invitations });
  } catch (error) {
    console.error('Get board invitations error:', error);
    res.status(500).json({ error: 'Failed to get board invitations' });
  }
});

// Accept board invitation
router.post('/invitations/:token/accept', authenticateToken, async (req, res) => {
  try {
    const { token } = req.params;
    
    const invitation = await BoardInvitation.findByToken(token);
    if (!invitation) {
      return res.status(400).json({ error: 'Invalid or expired invitation' });
    }
    
    const result = await invitation.accept(req.user.id);
    
    res.json({
      message: 'Invitation accepted successfully',
      board: result.permission
    });
    
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Decline board invitation
router.post('/invitations/:token/decline', authenticateToken, async (req, res) => {
  try {
    const { token } = req.params;
    
    const invitation = await BoardInvitation.findByToken(token);
    if (!invitation) {
      return res.status(400).json({ error: 'Invalid or expired invitation' });
    }
    
    await invitation.decline();
    
    res.json({ message: 'Invitation declined successfully' });
    
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({ error: 'Failed to decline invitation' });
  }
});

// Get user's pending invitations
router.get('/invitations/pending', authenticateToken, async (req, res) => {
  try {
    const invitations = await BoardInvitation.findPendingByEmail(req.user.email);
    res.json({ invitations });
  } catch (error) {
    console.error('Get pending invitations error:', error);
    res.status(500).json({ error: 'Failed to get pending invitations' });
  }
});

// ============================
// Board Content Routes (Lists, Nodes, Edges)
// ============================

// Get full board data (lists, nodes, edges)
router.get('/:boardId/data', authenticateToken, requireBoardViewer, async (req, res) => {
  try {
    const boardData = await req.board.getFullBoardData();
    res.json({ board: boardData });
  } catch (error) {
    console.error('Get board data error:', error);
    res.status(500).json({ error: 'Failed to get board data' });
  }
});

// ============================
// List Routes
// ============================

// Create list
router.post('/:boardId/lists', authenticateToken, requireBoardContributor, async (req, res) => {
  try {
    const { id, name, color, type, nodeIds = [] } = req.body;
    
    if (!id || !name || !color || !type) {
      return res.status(400).json({ error: 'List id, name, color, and type are required' });
    }
    
    const list = await BoardList.create({ id, name, color, type, nodeIds });
    await req.board.addList(id);
    
    res.status(201).json({
      message: 'List created successfully',
      list: list.toJSON()
    });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

// Update list
router.put('/:boardId/lists/:listId', authenticateToken, requireBoardContributor, async (req, res) => {
  try {
    const { listId } = req.params;
    const { name, color, type, nodeIds } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (type !== undefined) updateData.type = type;
    if (nodeIds !== undefined) updateData.nodeIds = nodeIds;
    
    const updatedList = await BoardList.update(listId, updateData);
    
    if (!updatedList) {
      return res.status(404).json({ error: 'List not found' });
    }
    
    res.json({
      message: 'List updated successfully',
      list: updatedList.toJSON()
    });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
});

// Delete list
router.delete('/:boardId/lists/:listId', authenticateToken, requireBoardContributor, async (req, res) => {
  try {
    const { listId } = req.params;
    
    await req.board.removeList(listId);
    await BoardList.delete(listId);
    
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

// Reorder lists
router.put('/:boardId/lists-order', authenticateToken, requireBoardContributor, async (req, res) => {
  try {
    const { listIds } = req.body;
    
    if (!Array.isArray(listIds)) {
      return res.status(400).json({ error: 'listIds must be an array' });
    }
    
    await req.board.reorderLists(listIds);
    
    res.json({ message: 'Lists reordered successfully' });
  } catch (error) {
    console.error('Reorder lists error:', error);
    res.status(500).json({ error: 'Failed to reorder lists' });
  }
});

// ============================
// Node Comment Routes
// ============================

// Get comments for a node
router.get('/:boardId/nodes/:nodeId/comments', authenticateToken, requireBoardViewer, async (req, res) => {
  try {
    const { nodeId } = req.params;
    
    // Verify node exists
    const node = await BoardNode.findById(nodeId);
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }
    
    const comments = await BoardNodeComment.findByNodeId(nodeId);
    res.json({ comments: comments.map(c => c.toJSON()) });
  } catch (error) {
    console.error('Get node comments error:', error);
    res.status(500).json({ error: 'Failed to get node comments' });
  }
});

// Create comment on a node
router.post('/:boardId/nodes/:nodeId/comments', authenticateToken, requireBoardContributor, async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    // Verify node exists
    const node = await BoardNode.findById(nodeId);
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }
    
    const comment = await BoardNodeComment.create({
      node_id: nodeId,
      user_id: req.user.id,
      content: content.trim()
    });
    
    // Fetch the comment with user info
    const commentWithUser = await BoardNodeComment.findById(comment.id);
    
    res.status(201).json({
      message: 'Comment created successfully',
      comment: commentWithUser.toJSON()
    });
  } catch (error) {
    console.error('Create node comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Update node comment
router.put('/:boardId/nodes/:nodeId/comments/:commentId', authenticateToken, requireBoardContributor, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    const comment = await BoardNodeComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Only comment owner or board owner can update comment
    if (comment.user_id !== req.user.id && req.board.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }
    
    const updatedComment = await BoardNodeComment.update(commentId, { content: content.trim() });
    const commentWithUser = await BoardNodeComment.findById(updatedComment.id);
    
    res.json({
      message: 'Comment updated successfully',
      comment: commentWithUser.toJSON()
    });
  } catch (error) {
    console.error('Update node comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete node comment
router.delete('/:boardId/nodes/:nodeId/comments/:commentId', authenticateToken, requireBoardContributor, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await BoardNodeComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Only comment owner or board owner can delete comment
    if (comment.user_id !== req.user.id && req.board.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }
    
    await BoardNodeComment.delete(commentId);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete node comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// ============================
// Edge Comment Routes
// ============================

// Get comments for an edge
router.get('/:boardId/edges/:edgeId/comments', authenticateToken, requireBoardViewer, async (req, res) => {
  try {
    const { edgeId } = req.params;
    
    // Verify edge exists
    const edge = await BoardEdge.findById(edgeId);
    if (!edge) {
      return res.status(404).json({ error: 'Edge not found' });
    }
    
    const comments = await BoardEdgeComment.findByEdgeId(edgeId);
    res.json({ comments: comments.map(c => c.toJSON()) });
  } catch (error) {
    console.error('Get edge comments error:', error);
    res.status(500).json({ error: 'Failed to get edge comments' });
  }
});

// Create comment on an edge
router.post('/:boardId/edges/:edgeId/comments', authenticateToken, requireBoardContributor, async (req, res) => {
  try {
    const { edgeId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    // Verify edge exists
    const edge = await BoardEdge.findById(edgeId);
    if (!edge) {
      return res.status(404).json({ error: 'Edge not found' });
    }
    
    const comment = await BoardEdgeComment.create({
      edge_id: edgeId,
      user_id: req.user.id,
      content: content.trim()
    });
    
    // Fetch the comment with user info
    const commentWithUser = await BoardEdgeComment.findById(comment.id);
    
    res.status(201).json({
      message: 'Comment created successfully',
      comment: commentWithUser.toJSON()
    });
  } catch (error) {
    console.error('Create edge comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Update edge comment
router.put('/:boardId/edges/:edgeId/comments/:commentId', authenticateToken, requireBoardContributor, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    const comment = await BoardEdgeComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Only comment owner or board owner can update comment
    if (comment.user_id !== req.user.id && req.board.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }
    
    const updatedComment = await BoardEdgeComment.update(commentId, { content: content.trim() });
    const commentWithUser = await BoardEdgeComment.findById(updatedComment.id);
    
    res.json({
      message: 'Comment updated successfully',
      comment: commentWithUser.toJSON()
    });
  } catch (error) {
    console.error('Update edge comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete edge comment
router.delete('/:boardId/edges/:edgeId/comments/:commentId', authenticateToken, requireBoardContributor, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await BoardEdgeComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Only comment owner or board owner can delete comment
    if (comment.user_id !== req.user.id && req.board.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }
    
    await BoardEdgeComment.delete(commentId);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete edge comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});


export default router;
