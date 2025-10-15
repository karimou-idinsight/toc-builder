import pool from '../config/database.js';

class BoardEdgeAssumption {
  constructor(data) {
    this.id = data.id;
    this.edge_id = data.edge_id;
    this.user_id = data.user_id;
    this.content = data.content;
    this.strength = data.strength;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.user = data.user || null;
  }

  static async findById(id) {
    const query = `
      SELECT bea.*, 
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email,
          'avatar_url', u.avatar_url
        ) as user
      FROM board_edge_assumptions bea
      LEFT JOIN users u ON bea.user_id = u.id
      WHERE bea.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? new BoardEdgeAssumption(result.rows[0]) : null;
  }

  static async findByEdgeId(edgeId) {
    const query = `
      SELECT bea.*, 
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email,
          'avatar_url', u.avatar_url
        ) as user
      FROM board_edge_assumptions bea
      LEFT JOIN users u ON bea.user_id = u.id
      WHERE bea.edge_id = $1
      ORDER BY bea.created_at DESC
    `;
    const result = await pool.query(query, [edgeId]);
    return result.rows.map(row => new BoardEdgeAssumption(row));
  }

  static async findByEdgeIds(edgeIds) {
    if (!edgeIds || edgeIds.length === 0) return [];
    
    const query = `
      SELECT bea.*, 
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email,
          'avatar_url', u.avatar_url
        ) as user
      FROM board_edge_assumptions bea
      LEFT JOIN users u ON bea.user_id = u.id
      WHERE bea.edge_id = ANY($1)
      ORDER BY bea.created_at DESC
    `;
    const result = await pool.query(query, [edgeIds]);
    return result.rows.map(row => new BoardEdgeAssumption(row));
  }

  static async create(data) {
    const query = `
      INSERT INTO board_edge_assumptions (edge_id, user_id, content, strength)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      data.edge_id,
      data.user_id,
      data.content,
      data.strength || 'medium'
    ];
    
    const result = await pool.query(query, values);
    return new BoardEdgeAssumption(result.rows[0]);
  }

  static async update(id, updates) {
    const allowedFields = ['content', 'strength'];
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
      const existing = await BoardEdgeAssumption.findById(id);
      return existing;
    }

    const query = `
      UPDATE board_edge_assumptions 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? new BoardEdgeAssumption(result.rows[0]) : null;
  }

  static async delete(id) {
    const query = 'DELETE FROM board_edge_assumptions WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }

  toJSON() {
    return {
      id: this.id,
      edge_id: this.edge_id,
      user_id: this.user_id,
      content: this.content,
      strength: this.strength,
      user: this.user,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default BoardEdgeAssumption;


