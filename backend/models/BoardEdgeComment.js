import pool from '../config/database.js';

class BoardEdgeComment {
  constructor(data) {
    this.id = data.id;
    this.edge_id = data.edge_id;
    this.user_id = data.user_id;
    this.content = data.content;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    
    // User info if joined
    this.user = data.user || null;
  }

  // Create a new edge comment
  static async create(commentData) {
    const { edge_id, user_id, content } = commentData;
    
    const query = `
      INSERT INTO board_edge_comments (edge_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [edge_id, user_id, content];
    const result = await pool.query(query, values);
    
    return new BoardEdgeComment(result.rows[0]);
  }

  // Find comment by ID
  static async findById(id) {
    const query = `
      SELECT c.*, 
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email,
          'avatar_url', u.avatar_url
        ) as user
      FROM board_edge_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new BoardEdgeComment(result.rows[0]);
  }

  // Find all comments for an edge
  static async findByEdgeId(edge_id) {
    const query = `
      SELECT c.*, 
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email,
          'avatar_url', u.avatar_url
        ) as user
      FROM board_edge_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.edge_id = $1
      ORDER BY c.created_at ASC
    `;
    const result = await pool.query(query, [edge_id]);
    
    return result.rows.map(row => new BoardEdgeComment(row));
  }

  // Find comments for multiple edges
  static async findByEdgeIds(edge_ids) {
    if (!edge_ids || edge_ids.length === 0) {
      return [];
    }
    
    const query = `
      SELECT c.*, 
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email,
          'avatar_url', u.avatar_url
        ) as user
      FROM board_edge_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.edge_id = ANY($1)
      ORDER BY c.created_at ASC
    `;
    const result = await pool.query(query, [edge_ids]);
    
    return result.rows.map(row => new BoardEdgeComment(row));
  }

  // Find comments by user
  static async findByUserId(user_id) {
    const query = `
      SELECT c.*, 
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email,
          'avatar_url', u.avatar_url
        ) as user
      FROM board_edge_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query, [user_id]);
    
    return result.rows.map(row => new BoardEdgeComment(row));
  }

  // Update comment
  static async update(id, updates) {
    const allowedFields = ['content', 'status'];
    const fields = [];
    const values = [];

    Object.keys(updates).forEach((key, index) => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${index + 1}`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) {
      const existing = await BoardEdgeComment.findById(id);
      return existing;
    }

    const query = `
      UPDATE board_edge_comments 
      SET ${fields.join(', ')}
      WHERE id = ${id}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? new BoardEdgeComment(result.rows[0]) : null;
  }

  // Delete comment
  static async delete(id) {
    const query = 'DELETE FROM board_edge_comments WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    return result.rows.length > 0;
  }

  // Delete all comments for an edge
  static async deleteByEdgeId(edge_id) {
    const query = 'DELETE FROM board_edge_comments WHERE edge_id = $1 RETURNING *';
    const result = await pool.query(query, [edge_id]);
    
    return result.rowCount;
  }

  // Check if user owns comment
  async isOwnedBy(userId) {
    return this.user_id === userId;
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      id: this.id,
      edge_id: this.edge_id,
      user_id: this.user_id,
      content: this.content,
      status: this.status,
      user: this.user,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default BoardEdgeComment;

