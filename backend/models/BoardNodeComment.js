import pool from '../config/database.js';

class BoardNodeComment {
  constructor(data) {
    this.id = data.id;
    this.node_id = data.node_id;
    this.user_id = data.user_id;
    this.content = data.content;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    
    // User info if joined
    this.user = data.user || null;
  }

  // Create a new node comment
  static async create(commentData) {
    const { node_id, user_id, content } = commentData;
    
    const query = `
      INSERT INTO board_node_comments (node_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [node_id, user_id, content];
    const result = await pool.query(query, values);
    
    return new BoardNodeComment(result.rows[0]);
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
      FROM board_node_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new BoardNodeComment(result.rows[0]);
  }

  // Find all comments for a node
  static async findByNodeId(node_id) {
    const query = `
      SELECT c.*, 
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email,
          'avatar_url', u.avatar_url
        ) as user
      FROM board_node_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.node_id = $1
      ORDER BY c.created_at ASC
    `;
    const result = await pool.query(query, [node_id]);
    
    return result.rows.map(row => new BoardNodeComment(row));
  }

  // Find comments for multiple nodes
  static async findByNodeIds(node_ids) {
    if (!node_ids || node_ids.length === 0) {
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
      FROM board_node_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.node_id = ANY($1)
      ORDER BY c.created_at ASC
    `;
    const result = await pool.query(query, [node_ids]);
    
    return result.rows.map(row => new BoardNodeComment(row));
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
      FROM board_node_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query, [user_id]);
    
    return result.rows.map(row => new BoardNodeComment(row));
  }

  // Update comment
  static async update(id, updates) {
    const allowedFields = ['content'];
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      const existing = await BoardNodeComment.findById(id);
      return existing;
    }

    values.push(id);
    const query = `
      UPDATE board_node_comments 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? new BoardNodeComment(result.rows[0]) : null;
  }

  // Delete comment
  static async delete(id) {
    const query = 'DELETE FROM board_node_comments WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    return result.rows.length > 0;
  }

  // Delete all comments for a node
  static async deleteByNodeId(node_id) {
    const query = 'DELETE FROM board_node_comments WHERE node_id = $1 RETURNING *';
    const result = await pool.query(query, [node_id]);
    
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
      node_id: this.node_id,
      user_id: this.user_id,
      content: this.content,
      user: this.user,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default BoardNodeComment;

