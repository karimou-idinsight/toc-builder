import pool from '../config/database.js';

class BoardNode {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description || '';
    this.type = data.type;
    this.tags = data.tags || [];
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  // Create a new node
  static async create(nodeData) {
    const { id, title, description = '', type, tags = [] } = nodeData;
    
    const query = `
      INSERT INTO board_nodes (id, title, description, type, tags)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [id, title, description, type, JSON.stringify(tags)];
    const result = await pool.query(query, values);
    
    return new BoardNode(result.rows[0]);
  }

  // Find node by ID
  static async findById(id) {
    const query = 'SELECT * FROM board_nodes WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new BoardNode(result.rows[0]);
  }

  // Find multiple nodes by IDs
  static async findByIds(ids) {
    if (!ids || ids.length === 0) {
      return [];
    }
    
    const query = 'SELECT * FROM board_nodes WHERE id = ANY($1)';
    const result = await pool.query(query, [ids]);
    
    return result.rows.map(row => new BoardNode(row));
  }

  // Find nodes by tag
  static async findByTag(tag) {
    const query = `
      SELECT * FROM board_nodes 
      WHERE tags @> $1
    `;
    const result = await pool.query(query, [JSON.stringify([tag])]);
    
    return result.rows.map(row => new BoardNode(row));
  }

  // Find nodes by multiple tags (any match)
  static async findByTags(tags) {
    if (!tags || tags.length === 0) {
      return [];
    }
    
    const query = `
      SELECT * FROM board_nodes 
      WHERE tags ?| $1
    `;
    const result = await pool.query(query, [tags]);
    
    return result.rows.map(row => new BoardNode(row));
  }

  // Get all unique tags across all nodes
  static async getAllTags() {
    const query = `
      SELECT DISTINCT jsonb_array_elements_text(tags) as tag
      FROM board_nodes
      WHERE jsonb_array_length(tags) > 0
      ORDER BY tag
    `;
    const result = await pool.query(query);
    
    return result.rows.map(row => row.tag);
  }

  // Update node
  static async update(id, updates) {
    const allowedFields = ['title', 'description', 'type', 'tags'];
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(key === 'tags' ? JSON.stringify(updates[key]) : updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      const existing = await BoardNode.findById(id);
      return existing;
    }

    values.push(id);
    const query = `
      UPDATE board_nodes 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? new BoardNode(result.rows[0]) : null;
  }

  // Delete node
  static async delete(id) {
    const query = 'DELETE FROM board_nodes WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    return result.rows.length > 0;
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      type: this.type,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default BoardNode;

