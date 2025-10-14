import express from 'express';
import User from '../models/User.js';
import { 
  authenticateToken, 
  requireSuperAdmin,
  rateLimit 
} from '../middleware/auth.js';

const router = express.Router();

// Get all users (super admin only)
router.get('/users', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const users = await User.getAllUsers(parseInt(limit), parseInt(offset));
    const totalCount = await User.getUserCount();
    
    res.json({ 
      users: users.map(user => user.toPublicJSON()),
      totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get specific user (super admin only)
router.get('/users/:userId', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Create new user (super admin only)
router.post('/users', authenticateToken, requireSuperAdmin, rateLimit(60 * 1000, 10), async (req, res) => {
  try {
    const { email, password, first_name, last_name, avatar_url, role = 'user' } = req.body;
    
    // Validation
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ 
        error: 'Email, password, first name, and last name are required' 
      });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }
    
    if (!['user', 'super_admin'].includes(role)) {
      return res.status(400).json({ 
        error: 'Role must be user or super_admin' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }
    
    // Create user
    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      avatar_url
    });
    
    // Update role if not default
    if (role !== 'user') {
      await user.update({ role });
    }
    
    res.status(201).json({
      message: 'User created successfully',
      user: user.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (super admin only)
router.put('/users/:userId', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { first_name, last_name, avatar_url, is_active, role } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (role !== undefined) {
      if (!['user', 'super_admin'].includes(role)) {
        return res.status(400).json({ error: 'Role must be user or super_admin' });
      }
      updateData.role = role;
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const updatedUser = await user.update(updateData);
    
    res.json({
      message: 'User updated successfully',
      user: updatedUser.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Deactivate user (super admin only)
router.put('/users/:userId/deactivate', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.isSuperAdmin()) {
      return res.status(403).json({ error: 'Cannot deactivate super admin' });
    }
    
    const updatedUser = await user.deactivateUser();
    
    res.json({
      message: 'User deactivated successfully',
      user: updatedUser.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

// Activate user (super admin only)
router.put('/users/:userId/activate', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const updatedUser = await user.activateUser();
    
    res.json({
      message: 'User activated successfully',
      user: updatedUser.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ error: 'Failed to activate user' });
  }
});

// Reset user password (super admin only)
router.put('/users/:userId/reset-password', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'New password must be at least 8 characters long' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.updatePassword(newPassword);
    
    res.json({ message: 'Password reset successfully' });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get system statistics (super admin only)
router.get('/stats', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { default: pool } = await import('../config/database.js');
    
    // Get user statistics
    const userStatsQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users
      FROM users
    `;
    
    const userStats = await pool.query(userStatsQuery);
    
    // Get board statistics
    const boardStatsQuery = `
      SELECT 
        COUNT(*) as total_boards,
        COUNT(CASE WHEN is_public = true THEN 1 END) as public_boards,
        COUNT(CASE WHEN is_public = false THEN 1 END) as private_boards
      FROM boards
    `;
    
    const boardStats = await pool.query(boardStatsQuery);
    
    res.json({
      users: userStats.rows[0],
      boards: boardStats.rows[0]
    });
    
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to get system statistics' });
  }
});

export default router;
