const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Board = require('../models/Board');
const BoardPermission = require('../models/BoardPermission');

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (user && user.is_active) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Board permission middleware
const requireBoardPermission = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const boardId = req.params.boardId || req.body.boardId;
      const userId = req.user.id;

      if (!boardId) {
        return res.status(400).json({ error: 'Board ID required' });
      }

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }

      const hasPermission = await board.hasPermission(userId, requiredRole);
      if (!hasPermission) {
        return res.status(403).json({ 
          error: `Insufficient permissions. Required: ${requiredRole}` 
        });
      }

      req.board = board;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Board ownership middleware
const requireBoardOwner = requireBoardPermission('owner');

// Board contributor middleware
const requireBoardContributor = requireBoardPermission('contributor');

// Board reviewer middleware
const requireBoardReviewer = requireBoardPermission('reviewer');

// Board viewer middleware
const requireBoardViewer = requireBoardPermission('viewer');

// Admin middleware (for system-wide admin operations)
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // For now, we'll implement a simple admin check
    // In a real app, you might have an admin role in the users table
    const isAdmin = req.user.email === process.env.ADMIN_EMAIL;
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Admin check failed' });
  }
};

// Rate limiting middleware (using Redis)
const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return async (req, res, next) => {
    try {
      const redis = require('../config/redis');
      const key = `rate_limit:${req.ip}:${req.route?.path || 'unknown'}`;
      
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }
      
      if (current > maxRequests) {
        return res.status(429).json({ 
          error: 'Too many requests',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }
      
      next();
    } catch (error) {
      // If Redis is down, continue without rate limiting
      console.warn('Rate limiting failed:', error.message);
      next();
    }
  };
};

// Email verification middleware
const requireEmailVerification = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.email_verified) {
      return res.status(403).json({ 
        error: 'Email verification required',
        email_verified: false
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Email verification check failed' });
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireBoardPermission,
  requireBoardOwner,
  requireBoardContributor,
  requireBoardReviewer,
  requireBoardViewer,
  requireAdmin,
  rateLimit,
  requireEmailVerification,
  generateToken,
  generateRefreshToken
};
