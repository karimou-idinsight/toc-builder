import pool from '../config/database.js';
import crypto from 'crypto';

class BoardInvitation {
  constructor(data) {
    this.id = data.id;
    this.board_id = data.board_id;
    this.email = data.email;
    this.role = data.role;
    this.token = data.token;
    this.invited_by = data.invited_by;
    this.expires_at = data.expires_at;
    this.accepted_at = data.accepted_at;
    this.created_at = data.created_at;
  }

  // Create a new invitation
  static async create(invitationData) {
    const { board_id, email, role, invited_by, expiresInHours = 168 } = invitationData; // Default 7 days
    
    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration date
    const expires_at = new Date(Date.now() + (expiresInHours * 60 * 60 * 1000));
    
    const query = `
      INSERT INTO board_invitations (board_id, email, role, token, invited_by, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [board_id, email, role, token, invited_by, expires_at];
    const result = await pool.query(query, values);
    
    return new BoardInvitation(result.rows[0]);
  }

  // Find invitation by token
  static async findByToken(token) {
    const query = `
      SELECT bi.*, b.title as board_title, u.first_name, u.last_name, u.email as inviter_email
      FROM board_invitations bi
      JOIN boards b ON bi.board_id = b.id
      JOIN users u ON bi.invited_by = u.id
      WHERE bi.token = $1 AND bi.expires_at > NOW() AND bi.accepted_at IS NULL
    `;
    
    const result = await pool.query(query, [token]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new BoardInvitation(result.rows[0]);
  }

  // Find invitations by board
  static async findByBoard(boardId) {
    const query = `
      SELECT bi.*, u.first_name, u.last_name, u.email as inviter_email
      FROM board_invitations bi
      JOIN users u ON bi.invited_by = u.id
      WHERE bi.board_id = $1
      ORDER BY bi.created_at DESC
    `;
    
    const result = await pool.query(query, [boardId]);
    return result.rows.map(row => new BoardInvitation(row));
  }

  // Find pending invitations by email
  static async findPendingByEmail(email) {
    const query = `
      SELECT bi.*, b.title as board_title, u.first_name, u.last_name, u.email as inviter_email
      FROM board_invitations bi
      JOIN boards b ON bi.board_id = b.id
      JOIN users u ON bi.invited_by = u.id
      WHERE bi.email = $1 AND bi.expires_at > NOW() AND bi.accepted_at IS NULL
      ORDER BY bi.created_at DESC
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows.map(row => new BoardInvitation(row));
  }

  // Check if invitation exists for email and board
  static async existsForEmailAndBoard(email, boardId) {
    const query = `
      SELECT id FROM board_invitations 
      WHERE email = $1 AND board_id = $2 AND expires_at > NOW() AND accepted_at IS NULL
    `;
    
    const result = await pool.query(query, [email, boardId]);
    return result.rows.length > 0;
  }

  // Accept invitation
  async accept(userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Mark invitation as accepted
      const acceptQuery = `
        UPDATE board_invitations 
        SET accepted_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const acceptResult = await client.query(acceptQuery, [this.id]);
      
      if (acceptResult.rows.length === 0) {
        throw new Error('Invitation not found or already accepted');
      }
      
      // Create board permission
      const permissionQuery = `
        INSERT INTO board_permissions (board_id, user_id, role, granted_by)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (board_id, user_id) DO UPDATE SET
          role = EXCLUDED.role,
          granted_by = EXCLUDED.granted_by,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      
      const permissionResult = await client.query(permissionQuery, [
        this.board_id, 
        userId, 
        this.role, 
        this.invited_by
      ]);
      
      await client.query('COMMIT');
      
      return {
        invitation: new BoardInvitation(acceptResult.rows[0]),
        permission: permissionResult.rows[0]
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Decline invitation
  async decline() {
    const query = `
      UPDATE board_invitations 
      SET accepted_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [this.id]);
    return new BoardInvitation(result.rows[0]);
  }

  // Delete invitation
  async delete() {
    const query = 'DELETE FROM board_invitations WHERE id = $1';
    await pool.query(query, [this.id]);
    return true;
  }

  // Delete expired invitations
  static async deleteExpired() {
    const query = 'DELETE FROM board_invitations WHERE expires_at < NOW()';
    const result = await pool.query(query);
    return result.rowCount;
  }

  // Resend invitation (create new token and extend expiration)
  async resend(expiresInHours = 168) {
    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpiresAt = new Date(Date.now() + (expiresInHours * 60 * 60 * 1000));
    
    const query = `
      UPDATE board_invitations 
      SET token = $1, expires_at = $2, accepted_at = NULL
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [newToken, newExpiresAt, this.id]);
    return new BoardInvitation(result.rows[0]);
  }

  // Check if invitation is valid (not expired and not accepted)
  isValid() {
    return this.expires_at > new Date() && this.accepted_at === null;
  }

  // Get invitation with board and inviter details
  async withDetails() {
    const query = `
      SELECT bi.*, b.title as board_title, b.description as board_description,
             u.first_name, u.last_name, u.email as inviter_email, u.avatar_url as inviter_avatar
      FROM board_invitations bi
      JOIN boards b ON bi.board_id = b.id
      JOIN users u ON bi.invited_by = u.id
      WHERE bi.id = $1
    `;
    
    const result = await pool.query(query, [this.id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      ...new BoardInvitation(row),
      board: {
        id: row.board_id,
        title: row.board_title,
        description: row.board_description
      },
      inviter: {
        id: row.invited_by,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.inviter_email,
        avatar_url: row.inviter_avatar
      }
    };
  }

  toJSON() {
    return {
      id: this.id,
      board_id: this.board_id,
      email: this.email,
      role: this.role,
      token: this.token,
      invited_by: this.invited_by,
      expires_at: this.expires_at,
      accepted_at: this.accepted_at,
      created_at: this.created_at
    };
  }
}

export default BoardInvitation;
