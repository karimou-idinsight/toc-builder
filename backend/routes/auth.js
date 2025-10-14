import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User.js';
import { 
  authenticateToken, 
  generateToken, 
  generateRefreshToken,
  rateLimit 
} from '../middleware/auth.js';

const router = express.Router();

// Configure Passport Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await User.findByEmail(email);
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      if (!user.is_active) {
        return done(null, false, { message: 'Account is deactivated' });
      }
      
      const isValidPassword = await user.verifyPassword(password);
      
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Register new user
router.post('/register', rateLimit(15 * 60 * 1000, 5), async (req, res) => {
  try {
    const { email, password, first_name, last_name, avatar_url } = req.body;
    
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
    
    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    
    res.status(201).json({
      message: 'User created successfully',
      user: user.toPublicJSON(),
      accessToken,
      refreshToken
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', rateLimit(15 * 60 * 1000, 10), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    if (!user.is_active) {
      return res.status(401).json({ 
        error: 'Account is deactivated' 
      });
    }
    
    const isValidPassword = await user.verifyPassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    // Update last login
    await user.updateLastLogin();
    
    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    
    res.json({
      message: 'Login successful',
      user: user.toPublicJSON(),
      accessToken,
      refreshToken
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just return success
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user.toPublicJSON()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid user' });
    }
    
    // Generate new tokens
    const newAccessToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);
    
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Request password reset
router.post('/forgot-password', rateLimit(15 * 60 * 1000, 3), async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await User.findByEmail(email);
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ 
        message: 'If the email exists, a password reset link has been sent' 
      });
    }
    
    const { user: updatedUser, token } = await user.setPasswordResetToken();
    
    // In a real application, you would send an email here
    console.log(`Password reset token for ${email}: ${token}`);
    
    res.json({ 
      message: 'If the email exists, a password reset link has been sent' 
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Password reset request failed' });
  }
});

// Reset password
router.post('/reset-password', rateLimit(15 * 60 * 1000, 5), async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        error: 'Token and new password are required' 
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }
    
    const user = await User.findByPasswordResetToken(token);
    
    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }
    
    await user.updatePassword(newPassword);
    
    res.json({ message: 'Password reset successful' });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }
    
    const user = await User.findByEmailVerificationToken(token);
    
    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid verification token' 
      });
    }
    
    await user.verifyEmail();
    
    res.json({ message: 'Email verified successfully' });
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

export default router;
