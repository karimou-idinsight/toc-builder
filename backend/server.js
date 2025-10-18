import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import passport from 'passport';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });


import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn } from 'node:child_process';

import redis from './config/redis.js';
import { rateLimit } from './middleware/auth.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import boardRoutes from './routes/boards.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Spawn the Next.js server
const NEXT_PORT = process.env.NEXT_PORT || 3000;
const WEB_DIR = path.join(__dirname, '../web');

// dev: `npm run dev`  |  prod: `npm run start` (after `next build`)
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const nextArgs = process.env.NODE_ENV !== 'production'
  ? ['run', 'dev', '--', '-p', String(NEXT_PORT)]
  : ['run', 'start', '--', '-p', String(NEXT_PORT)];

const nextProc = spawn(npmCmd, nextArgs, {
  cwd: WEB_DIR,
  env: { ...process.env },
  stdio: 'inherit'
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration with Redis
app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV !== 'local',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting - Only apply in production, use generous limits in development
if (process.env.NODE_ENV !== 'local') {
  app.use(rateLimit());
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/admin', adminRoutes);


// Your API routes
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Everything else → Next
app.use('/', createProxyMiddleware({
  target: `http://127.0.0.1:${NEXT_PORT}`,
  changeOrigin: true,
  ws: true
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation error',
      details: err.message 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Unauthorized' 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'local' && { details: err.message })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Optional: tidy shutdown
process.on('SIGTERM', () => nextProc.kill('SIGTERM'));
process.on('SIGINT', () => nextProc.kill('SIGINT'));

export default app;