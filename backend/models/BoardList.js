import pool from '../config/database.js';

class BoardList {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.color = data.color;
    this.type = data.type;
    this.nodeIds = data.node_ids || data.nodeIds || [];
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  // Create a new list
  static async create(listData) {
    const { id, name, color, type, nodeIds = [] } = listData;
    
    const query = `
      INSERT INTO board_lists (id, name, color, type, node_ids)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [id, name, color, type, JSON.stringify(nodeIds)];
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
      const dbKey = key === 'nodeIds' ? 'node_ids' : key;
      if (allowedFields.includes(dbKey)) {
        fields.push(`${dbKey} = $${paramCount}`);
        values.push(dbKey === 'node_ids' ? JSON.stringify(updates[key]) : updates[key]);
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
    const nodeIds = [...this.nodeIds, nodeId];
    return BoardList.update(this.id, { nodeIds });
  }

  // Remove node from list
  async removeNode(nodeId) {
    const nodeIds = this.nodeIds.filter(id => id !== nodeId);
    return BoardList.update(this.id, { nodeIds });
  }

  // Reorder nodes in list
  async reorderNodes(nodeIds) {
    return BoardList.update(this.id, { nodeIds });
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      type: this.type,
      nodeIds: this.nodeIds,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default BoardList;

