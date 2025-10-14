import pool from '../config/database.js';

class BoardEdge {
  constructor(data) {
    this.id = data.id;
    this.source_node_id = data.source_node_id;
    this.target_node_id = data.target_node_id;
    this.type = data.type;
    this.label = data.label || '';
    this.created_at = data.created_at;
  }

  // Create a new edge
  static async create(edgeData) {
    const { id, source_node_id, target_node_id, type, label = '' } = edgeData;
    
    // Prevent self-referencing edges
    if (source_node_id === target_node_id) {
      throw new Error('Cannot create edge from node to itself');
    }
    
    const query = `
      INSERT INTO board_edges (id, source_node_id, target_node_id, type, label)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [id, source_node_id, target_node_id, type, label];
    const result = await pool.query(query, values);
    
    return new BoardEdge(result.rows[0]);
  }

  // Find edge by ID
  static async findById(id) {
    const query = 'SELECT * FROM board_edges WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new BoardEdge(result.rows[0]);
  }

  // Find edges by source node
  static async findBySourceNode(source_node_id) {
    const query = 'SELECT * FROM board_edges WHERE source_node_id = $1';
    const result = await pool.query(query, [source_node_id]);
    
    return result.rows.map(row => new BoardEdge(row));
  }

  // Find edges by target node
  static async findByTargetNode(target_node_id) {
    const query = 'SELECT * FROM board_edges WHERE target_node_id = $1';
    const result = await pool.query(query, [target_node_id]);
    
    return result.rows.map(row => new BoardEdge(row));
  }

  // Find edges connected to a node (either source or target)
  static async findByNode(nodeId) {
    const query = `
      SELECT * FROM board_edges 
      WHERE source_node_id = $1 OR target_node_id = $1
    `;
    const result = await pool.query(query, [nodeId]);
    
    return result.rows.map(row => new BoardEdge(row));
  }

  // Find edges for multiple nodes
  static async findByNodes(nodeIds) {
    if (!nodeIds || nodeIds.length === 0) {
      return [];
    }
    
    const query = `
      SELECT * FROM board_edges 
      WHERE source_node_id = ANY($1) AND target_node_id = ANY($1)
    `;
    const result = await pool.query(query, [nodeIds]);
    
    return result.rows.map(row => new BoardEdge(row));
  }

  // Check if edge exists between two nodes
  static async exists(sourceNodeId, targetNodeId) {
    const query = `
      SELECT id FROM board_edges 
      WHERE source_node_id = $1 AND target_node_id = $2
    `;
    const result = await pool.query(query, [sourceNodeId, targetNodeId]);
    
    return result.rows.length > 0;
  }

  // Update edge
  static async update(id, updates) {
    const allowedFields = ['type', 'label'];
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
      const existing = await BoardEdge.findById(id);
      return existing;
    }

    values.push(id);
    const query = `
      UPDATE board_edges 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? new BoardEdge(result.rows[0]) : null;
  }

  // Delete edge
  static async delete(id) {
    const query = 'DELETE FROM board_edges WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    return result.rows.length > 0;
  }

  // Delete all edges connected to a node
  static async deleteByNode(nodeId) {
    const query = `
      DELETE FROM board_edges 
      WHERE source_node_id = $1 OR target_node_id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [nodeId]);
    
    return result.rowCount;
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      id: this.id,
      source_node_id: this.source_node_id,
      target_node_id: this.target_node_id,
      type: this.type,
      label: this.label,
      created_at: this.created_at
    };
  }
}

export default BoardEdge;

