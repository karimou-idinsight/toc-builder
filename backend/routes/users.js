import express from 'express';
import User from '../models/User.js';
import { 
  authenticateToken, 
  requireEmailVerification,
  rateLimit 
} from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user.toPublicJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const { first_name, last_name, avatar_url } = req.body;
    
    const allowedFields = {};
    if (first_name !== undefined) allowedFields.first_name = first_name;
    if (last_name !== undefined) allowedFields.last_name = last_name;
    if (avatar_url !== undefined) allowedFields.avatar_url = avatar_url;
    
    if (Object.keys(allowedFields).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const updatedUser = await req.user.update(allowedFields);
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'New password must be at least 8 characters long' 
      });
    }
    
    const isValidPassword = await req.user.verifyPassword(currentPassword);
    
    if (!isValidPassword) {
      return res.status(400).json({ 
        error: 'Current password is incorrect' 
      });
    }
    
    await req.user.updatePassword(newPassword);
    
    res.json({ message: 'Password changed successfully' });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Deactivate account
router.delete('/account', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required to deactivate account' });
    }
    
    const isValidPassword = await req.user.verifyPassword(password);
    
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }
    
    await req.user.update({ is_active: false });
    
    res.json({ message: 'Account deactivated successfully' });
    
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ error: 'Failed to deactivate account' });
  }
});

// Get user's boards
router.get('/boards', authenticateToken, async (req, res) => {
  try {
    const { default: Board } = await import('../models/Board.js');
    const boards = await Board.findByUserAccess(req.user.id);
    
    res.json({ boards });
    
  } catch (error) {
    console.error('Get user boards error:', error);
    res.status(500).json({ error: 'Failed to get user boards' });
  }
});

// Search users (for invitations)
router.get('/search', authenticateToken, rateLimit(60 * 1000, 20), async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters long' 
      });
    }
    
    const { default: pool } = await import('../config/database.js');
    const query = `
      SELECT id, email, first_name, last_name, avatar_url
      FROM users
      WHERE is_active = true 
        AND email_verified = true
        AND (
          email ILIKE $1 OR 
          first_name ILIKE $1 OR 
          last_name ILIKE $1 OR
          CONCAT(first_name, ' ', last_name) ILIKE $1
        )
        AND id != $2
      ORDER BY 
        CASE 
          WHEN email ILIKE $1 THEN 1
          WHEN CONCAT(first_name, ' ', last_name) ILIKE $1 THEN 2
          WHEN first_name ILIKE $1 THEN 3
          WHEN last_name ILIKE $1 THEN 4
          ELSE 5
        END,
        first_name, last_name
      LIMIT $3
    `;
    
    const searchTerm = `%${q}%`;
    const result = await pool.query(query, [searchTerm, req.user.id, parseInt(limit)]);
    
    res.json({ 
      users: result.rows.map(user => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url
      }))
    });
    
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { default: pool } = await import('../config/database.js');
    
    // Get board statistics
    const boardStatsQuery = `
      SELECT 
        COUNT(CASE WHEN b.owner_id = $1 THEN 1 END) as owned_boards,
        COUNT(CASE WHEN bp.user_id = $1 THEN 1 END) as shared_boards,
        COUNT(CASE WHEN b.is_public = true AND b.owner_id = $1 THEN 1 END) as public_boards
      FROM boards b
      LEFT JOIN board_permissions bp ON b.id = bp.board_id AND bp.user_id = $1
    `;
    
    const boardStats = await pool.query(boardStatsQuery, [req.user.id]);
    
    // Get invitation statistics
    const invitationStatsQuery = `
      SELECT 
        COUNT(CASE WHEN bi.email = $1 AND bi.expires_at > NOW() AND bi.accepted_at IS NULL THEN 1 END) as pending_invitations,
        COUNT(CASE WHEN bi.invited_by = $1 AND bi.expires_at > NOW() AND bi.accepted_at IS NULL THEN 1 END) as sent_invitations
      FROM board_invitations bi
    `;
    
    const invitationStats = await pool.query(invitationStatsQuery, [req.user.id]);
    
    res.json({
      boards: boardStats.rows[0],
      invitations: invitationStats.rows[0]
    });
    
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get user statistics' });
  }
});

export default router;
