import pool from '../config/database.js';

class BoardList {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.color = data.color;
    this.type = data.type;
    
    // Parse node_ids - could be array or string (JSONB)
    const node_ids = data.node_ids;
    if (typeof node_ids === 'string') {
      this.node_ids = JSON.parse(node_ids);
    } else if (Array.isArray(node_ids)) {
      this.node_ids = node_ids;
    } else {
      this.node_ids = [];
    }
    
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new list
  static async create(listData) {
    const { id, name, color, type, node_ids = [] } = listData;
    
    const query = `
      INSERT INTO board_lists (id, name, color, type, node_ids)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [id, name, color, type, JSON.stringify(node_ids)];
    const result = await pool.query(query, values);
    
    return new BoardList(result.rows[0]);
  }

  // Find list by ID
  static async findById(id) {
    const query = 'SELECT * FROM board_lists WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new BoardList(result.rows[0]);
  }

  // Find multiple lists by IDs
  static async findByIds(ids) {
    if (!ids || ids.length === 0) {
      return [];
    }
    
    const query = 'SELECT * FROM board_lists WHERE id = ANY($1)';
    const result = await pool.query(query, [ids]);
    
    return result.rows.map(row => new BoardList(row));
  }

  // Update list
  static async update(id, updates) {
    const allowedFields = ['name', 'color', 'type', 'node_ids'];
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(key === 'node_ids' ? JSON.stringify(updates[key]) : updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      const existing = await BoardList.findById(id);
      return existing;
    }

    values.push(id);
    const query = `
      UPDATE board_lists 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? new BoardList(result.rows[0]) : null;
  }

  // Delete list
  static async delete(id) {
    const query = 'DELETE FROM board_lists WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    return result.rows.length > 0;
  }

  // Add node to list
  async addNode(nodeId) {
    const node_ids = [...this.node_ids, nodeId];
    return BoardList.update(this.id, { node_ids });
  }

  // Remove node from list
  async removeNode(nodeId) {
    const node_ids = this.node_ids.filter(id => id !== nodeId);
    return BoardList.update(this.id, { node_ids });
  }

  // Reorder nodes in list
  async reorderNodes(node_ids) {
    return BoardList.update(this.id, { node_ids });
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      type: this.type,
      node_ids: this.node_ids,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default BoardList;

