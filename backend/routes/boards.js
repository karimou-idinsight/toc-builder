import express from 'express';
import Board from '../models/Board.js';
import BoardPermission from '../models/BoardPermission.js';
import BoardInvitation from '../models/BoardInvitation.js';
import BoardList from '../models/BoardList.js';
import BoardNode from '../models/BoardNode.js';
import BoardEdge from '../models/BoardEdge.js';
import BoardNodeComment from '../models/BoardNodeComment.js';
import BoardEdgeComment from '../models/BoardEdgeComment.js';
import BoardEdgeAssumption from '../models/BoardEdgeAssumption.js';
import { 
  authenticateToken,
  optionalAuth,
  requireBoardOwner,
  requireBoardEditor,
  requireBoardReviewer,
  requireBoardViewer,
  allowPublicBoardViewer,
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
router.post('/', authenticateToken, async (req, res) => {
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
// Allows unauthenticated access to public boards
router.get('/:boardId/data', optionalAuth, allowPublicBoardViewer, async (req, res) => {
  try {
    // req.board is set by allowPublicBoardViewer middleware
    const boardData = await req.board.getFullBoardData();
    
    if (!boardData) {
      return res.status(404).json({ error: 'Board data not found' });
    }
    
    // Get user's role on this board (or 'viewer' for unauthenticated users on public boards)
    let userRole = 'viewer'; // Default for unauthenticated users on public boards
    
    if (req.user) {
      console.log('Getting user role for board:', req.board.id, 'user:', req.user.id);
      userRole = await BoardPermission.getUserRole(req.board.id, req.user.id);
      console.log('User role retrieved:', userRole);
    } else {
      console.log('Unauthenticated user accessing public board:', req.board.id);
    }
    
    // Add user role to response
    const response = {
      ...boardData,
      userRole: userRole || 'viewer' // Default to viewer if no role found
    };
    console.log('Sending response with userRole:', response.userRole);
    res.json(response);
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
router.put('/:boardId', authenticateToken, requireBoardEditor, async (req, res) => {
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
    
    if (!['editor', 'reviewer', 'viewer'].includes(role)) {
      return res.status(400).json({ 
        error: 'Role must be editor, reviewer, or viewer' 
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
    
    if (!role || !['editor', 'reviewer', 'viewer'].includes(role)) {
      return res.status(400).json({ 
        error: 'Valid role is required (editor, reviewer, or viewer)' 
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
router.post('/:boardId/invite', authenticateToken, requireBoardOwner, async (req, res) => {
  try {
    const { email, role } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }
    
    if (!['editor', 'reviewer', 'viewer'].includes(role)) {
      return res.status(400).json({ 
        error: 'Role must be editor, reviewer, or viewer' 
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
// List Routes
// ============================

// Create list
router.post('/:boardId/lists', authenticateToken, requireBoardEditor, async (req, res) => {
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
router.put('/:boardId/lists/:listId', authenticateToken, requireBoardEditor, async (req, res) => {
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
router.delete('/:boardId/lists/:listId', authenticateToken, requireBoardEditor, async (req, res) => {
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
router.put('/:boardId/lists-order', authenticateToken, requireBoardEditor, async (req, res) => {
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
router.post('/:boardId/nodes/:nodeId/comments', authenticateToken, requireBoardReviewer, async (req, res) => {
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
router.put('/:boardId/nodes/:nodeId/comments/:commentId', authenticateToken, requireBoardReviewer, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content, status } = req.body;
    
    const comment = await BoardNodeComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Get user's role on the board
    const userRole = await BoardPermission.getUserRole(req.board.id, req.user.id);
    
    // Only comment owner or board owner can update comment
    if (comment.user_id !== req.user.id && userRole !== 'owner') {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }
    
    const updateData = {};
    
    // Update content if provided
    if (content !== undefined) {
      if (content.trim().length === 0) {
        return res.status(400).json({ error: 'Comment content cannot be empty' });
      }
      updateData.content = content.trim();
    }
    
    // Update status if provided
    if (status !== undefined) {
      if (!['open', 'solved'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be "open" or "solved"' });
      }
      updateData.status = status;
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No update data provided' });
    }
    
    const updatedComment = await BoardNodeComment.update(commentId, updateData);
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
router.delete('/:boardId/nodes/:nodeId/comments/:commentId', authenticateToken, requireBoardReviewer, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await BoardNodeComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Get user's role on the board
    const userRole = await BoardPermission.getUserRole(req.board.id, req.user.id);
    
    // Only comment owner or board owner can delete comment
    if (comment.user_id !== req.user.id && userRole !== 'owner') {
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
router.post('/:boardId/edges/:edgeId/comments', authenticateToken, requireBoardReviewer, async (req, res) => {
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
router.put('/:boardId/edges/:edgeId/comments/:commentId', authenticateToken, requireBoardReviewer, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content, status } = req.body;
    
    const comment = await BoardEdgeComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Get user's role on the board
    const userRole = await BoardPermission.getUserRole(req.board.id, req.user.id);
    
    // Only comment owner or board owner can update comment
    if (comment.user_id !== req.user.id && userRole !== 'owner') {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }
    
    const updateData = {};
    
    // Update content if provided
    if (content !== undefined) {
      if (content.trim().length === 0) {
        return res.status(400).json({ error: 'Comment content cannot be empty' });
      }
      updateData.content = content.trim();
    }
    
    // Update status if provided
    if (status !== undefined) {
      if (!['open', 'solved'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be "open" or "solved"' });
      }
      updateData.status = status;
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No update data provided' });
    }
    
    const updatedComment = await BoardEdgeComment.update(commentId, updateData);
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
router.delete('/:boardId/edges/:edgeId/comments/:commentId', authenticateToken, requireBoardReviewer, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await BoardEdgeComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Get user's role on the board
    const userRole = await BoardPermission.getUserRole(req.board.id, req.user.id);
    
    // Only comment owner or board owner can delete comment
    if (comment.user_id !== req.user.id && userRole !== 'owner') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }
    
    await BoardEdgeComment.delete(commentId);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete edge comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// ============================================
// Edge Assumptions Routes
// ============================================

// Get all assumptions for an edge (public boards allow unauthenticated access)
router.get('/:boardId/edges/:edgeId/assumptions', optionalAuth, allowPublicBoardViewer, async (req, res) => {
  try {
    const { edgeId } = req.params;
    
    // Verify edge belongs to this board
    const edge = await BoardEdge.findById(edgeId);
    if (!edge) {
      return res.status(404).json({ error: 'Edge not found' });
    }
    
    const assumptions = await BoardEdgeAssumption.findByEdgeId(edgeId);
    
    res.json({
      assumptions: assumptions.map(a => a.toJSON())
    });
  } catch (error) {
    console.error('Get edge assumptions error:', error);
    res.status(500).json({ error: 'Failed to get assumptions' });
  }
});

// Create a new assumption for an edge
router.post('/:boardId/edges/:edgeId/assumptions', authenticateToken, requireBoardEditor, async (req, res) => {
  try {
    const { edgeId } = req.params;
    const { content, strength } = req.body;
    
    // Validate input
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Assumption content is required' });
    }
    
    // Validate strength
    const validStrengths = ['weak', 'medium', 'strong', 'evidence-backed'];
    if (strength && !validStrengths.includes(strength)) {
      return res.status(400).json({ error: 'Invalid strength value' });
    }
    
    // Verify edge belongs to this board
    const edge = await BoardEdge.findById(edgeId);
    if (!edge) {
      return res.status(404).json({ error: 'Edge not found' });
    }
    
    const assumption = await BoardEdgeAssumption.create({
      edge_id: edgeId,
      user_id: req.user.id,
      content: content.trim(),
      strength: strength || 'medium'
    });
    
    // Fetch with user data
    const assumptionWithUser = await BoardEdgeAssumption.findById(assumption.id);
    
    res.status(201).json({
      message: 'Assumption created successfully',
      assumption: assumptionWithUser.toJSON()
    });
  } catch (error) {
    console.error('Create edge assumption error:', error);
    res.status(500).json({ error: 'Failed to create assumption' });
  }
});

// Update an assumption
router.put('/:boardId/edges/:edgeId/assumptions/:assumptionId', authenticateToken, requireBoardEditor, async (req, res) => {
  try {
    const { assumptionId } = req.params;
    const { content, strength } = req.body;
    
    const assumption = await BoardEdgeAssumption.findById(assumptionId);
    if (!assumption) {
      return res.status(404).json({ error: 'Assumption not found' });
    }
    
    // Get user's role on the board
    const userRole = await BoardPermission.getUserRole(req.board.id, req.user.id);
    
    // Only assumption owner or board owner can update assumption
    if (assumption.user_id !== req.user.id && userRole !== 'owner') {
      return res.status(403).json({ error: 'Not authorized to update this assumption' });
    }
    
    const updateData = {};
    
    // Update content if provided
    if (content !== undefined) {
      if (content.trim().length === 0) {
        return res.status(400).json({ error: 'Assumption content cannot be empty' });
      }
      updateData.content = content.trim();
    }
    
    // Update strength if provided
    if (strength !== undefined) {
      const validStrengths = ['weak', 'medium', 'strong', 'evidence-backed'];
      if (!validStrengths.includes(strength)) {
        return res.status(400).json({ error: 'Invalid strength value' });
      }
      updateData.strength = strength;
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No update data provided' });
    }
    
    const updatedAssumption = await BoardEdgeAssumption.update(assumptionId, updateData);
    const assumptionWithUser = await BoardEdgeAssumption.findById(updatedAssumption.id);
    
    res.json({
      message: 'Assumption updated successfully',
      assumption: assumptionWithUser.toJSON()
    });
  } catch (error) {
    console.error('Update edge assumption error:', error);
    res.status(500).json({ error: 'Failed to update assumption' });
  }
});

// Delete an assumption
router.delete('/:boardId/edges/:edgeId/assumptions/:assumptionId', authenticateToken, requireBoardEditor, async (req, res) => {
  try {
    const { assumptionId } = req.params;
    
    const assumption = await BoardEdgeAssumption.findById(assumptionId);
    if (!assumption) {
      return res.status(404).json({ error: 'Assumption not found' });
    }
    
    // Get user's role on the board
    const userRole = await BoardPermission.getUserRole(req.board.id, req.user.id);
    
    // Only assumption owner or board owner can delete assumption
    if (assumption.user_id !== req.user.id && userRole !== 'owner') {
      return res.status(403).json({ error: 'Not authorized to delete this assumption' });
    }
    
    await BoardEdgeAssumption.delete(assumptionId);
    
    res.json({ message: 'Assumption deleted successfully' });
  } catch (error) {
    console.error('Delete edge assumption error:', error);
    res.status(500).json({ error: 'Failed to delete assumption' });
  }
});


export default router;
