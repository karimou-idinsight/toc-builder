import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Board from '../models/Board.js';
import BoardPermission from '../models/BoardPermission.js';

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

// Board permission middleware (requires authentication)
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

// Board permission middleware that allows public access for viewer role
const allowPublicBoardAccess = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const boardId = req.params.boardId || req.body.boardId;

      if (!boardId) {
        return res.status(400).json({ error: 'Board ID required' });
      }

      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }

      // If user is authenticated, check their permissions normally
      if (req.user) {
        const hasPermission = await board.hasPermission(req.user.id, requiredRole);
        if (!hasPermission) {
          return res.status(403).json({ 
            error: `Insufficient permissions. Required: ${requiredRole}` 
          });
        }
      } else {
        // User is not authenticated - check if board is public and role is viewer
        if (!board.is_public) {
          return res.status(401).json({ 
            error: 'Authentication required for private boards' 
          });
        }
        
        // Only allow viewer access for unauthenticated users
        const roleHierarchy = {
          'owner': 4,
          'editor': 3,
          'reviewer': 2,
          'viewer': 1
        };
        
        if (roleHierarchy[requiredRole] > roleHierarchy['viewer']) {
          return res.status(401).json({ 
            error: 'Authentication required for this action' 
          });
        }
      }

      req.board = board;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Board ownership middleware
const requireBoardOwner = requireBoardPermission('owner');

// Board editor middleware (can add/delete/modify nodes and edges)
const requireBoardEditor = requireBoardPermission('editor');

// Board reviewer middleware (can view and comment)
const requireBoardReviewer = requireBoardPermission('reviewer');

// Board viewer middleware (can only view)
const requireBoardViewer = requireBoardPermission('viewer');

// Public board viewer middleware (allows unauthenticated access to public boards)
const allowPublicBoardViewer = allowPublicBoardAccess('viewer');

// Backward compatibility alias
const requireBoardContributor = requireBoardPermission('editor');

// Super Admin middleware (for system-wide admin operations)
const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.isSuperAdmin()) {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Super admin check failed' });
  }
};

// Rate limiting middleware (using Redis)
const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return async (req, res, next) => {
    try {
      const redis = await import('../config/redis.js');
      const key = `rate_limit:${req.ip}:${req.route?.path || 'unknown'}`;
      
      const current = await redis.default.incr(key);
      
      if (current === 1) {
        await redis.default.expire(key, Math.ceil(windowMs / 1000));
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

export {
  authenticateToken,
  optionalAuth,
  requireBoardPermission,
  requireBoardOwner,
  requireBoardEditor,
  requireBoardContributor, // Backward compatibility
  requireBoardReviewer,
  requireBoardViewer,
  allowPublicBoardViewer,
  requireSuperAdmin,
  rateLimit,
  requireEmailVerification,
  generateToken,
  generateRefreshToken
};
