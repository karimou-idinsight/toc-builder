const express = require('express');
const Board = require('../models/Board');
const BoardPermission = require('../models/BoardPermission');
const BoardInvitation = require('../models/BoardInvitation');
const { 
  authenticateToken, 
  requireBoardOwner,
  requireBoardContributor,
  requireBoardViewer,
  requireEmailVerification,
  rateLimit 
} = require('../middleware/auth');

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
    const User = require('../models/User');
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
    const User = require('../models/User');
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

module.exports = router;
