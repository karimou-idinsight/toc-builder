import { createClient } from 'redis';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Use REDIS_URL if provided, otherwise fall back to default localhost
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Check if we need TLS (for Heroku and other hosted Redis services)
// Heroku Redis uses rediss:// protocol or requires TLS for redis:// in production
const usesTLS = redisUrl.startsWith('rediss://')

const redisClient = createClient({
  url: redisUrl,
  socket: {
    // Enable TLS for secure connections
    ...(usesTLS && {
      tls: true,
      rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false'
    }),
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis: Too many reconnection attempts');
        return new Error('Too many reconnection attempts');
      }
      // Exponential backoff: 100ms, 200ms, 400ms, etc., max 3 seconds
      return Math.min(retries * 100, 3000);
    }
  }
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Connect to Redis
redisClient.connect().catch(console.error);

export default redisClient;
