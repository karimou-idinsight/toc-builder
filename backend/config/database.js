import pkg from 'pg';
const { Pool } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const isLocal = process.env.NODE_ENV === 'local';

const pool = new Pool(
  isLocal
  ? {
      // Local: use individual database parameters
      database: process.env.DATABASE_NAME,
      port: process.env.DATABASE_PORT || 5432,
  }
  : {
      // Production: use DATABASE_URL
      connectionString: process.env.DATABASE_URL,
      ssl: {
          rejectUnauthorized: false
      }
  }
);



// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
