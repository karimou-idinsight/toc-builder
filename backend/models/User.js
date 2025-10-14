const pool = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.avatar_url = data.avatar_url;
    this.is_active = data.is_active;
    this.email_verified = data.email_verified;
    this.email_verification_token = data.email_verification_token;
    this.password_reset_token = data.password_reset_token;
    this.password_reset_expires = data.password_reset_expires;
    this.last_login = data.last_login;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { email, password, first_name, last_name, avatar_url } = userData;
    
    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Generate email verification token
    const email_verification_token = crypto.randomBytes(32).toString('hex');
    
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, avatar_url, email_verification_token)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [email, password_hash, first_name, last_name, avatar_url, email_verification_token];
    const result = await pool.query(query, values);
    
    return new User(result.rows[0]);
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new User(result.rows[0]);
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new User(result.rows[0]);
  }

  // Find user by email verification token
  static async findByEmailVerificationToken(token) {
    const query = 'SELECT * FROM users WHERE email_verification_token = $1';
    const result = await pool.query(query, [token]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new User(result.rows[0]);
  }

  // Find user by password reset token
  static async findByPasswordResetToken(token) {
    const query = 'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()';
    const result = await pool.query(query, [token]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new User(result.rows[0]);
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Update user
  async update(updateData) {
    const allowedFields = ['first_name', 'last_name', 'avatar_url', 'is_active'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(this.id);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return new User(result.rows[0]);
  }

  // Update password
  async updatePassword(newPassword) {
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    const query = `
      UPDATE users 
      SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [password_hash, this.id]);
    return new User(result.rows[0]);
  }

  // Verify email
  async verifyEmail() {
    const query = `
      UPDATE users 
      SET email_verified = true, email_verification_token = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [this.id]);
    return new User(result.rows[0]);
  }

  // Set password reset token
  async setPasswordResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour from now
    
    const query = `
      UPDATE users 
      SET password_reset_token = $1, password_reset_expires = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [token, expires, this.id]);
    return { user: new User(result.rows[0]), token };
  }

  // Update last login
  async updateLastLogin() {
    const query = `
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [this.id]);
    return new User(result.rows[0]);
  }

  // Get user's public data (without sensitive information)
  toPublicJSON() {
    return {
      id: this.id,
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name,
      avatar_url: this.avatar_url,
      is_active: this.is_active,
      email_verified: this.email_verified,
      last_login: this.last_login,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Get user's full data (for authenticated requests)
  toJSON() {
    return {
      ...this.toPublicJSON(),
      email_verification_token: this.email_verification_token,
      password_reset_token: this.password_reset_token,
      password_reset_expires: this.password_reset_expires
    };
  }
}

module.exports = User;
