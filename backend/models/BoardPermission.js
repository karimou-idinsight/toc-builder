import pool from '../config/database.js';

class BoardPermission {
  constructor(data) {
    this.id = data.id;
    this.board_id = data.board_id;
    this.user_id = data.user_id;
    this.role = data.role;
    this.granted_by = data.granted_by;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new permission
  static async create(permissionData) {
    const { board_id, user_id, role, granted_by } = permissionData;
    
    const query = `
      INSERT INTO board_permissions (board_id, user_id, role, granted_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [board_id, user_id, role, granted_by];
    const result = await pool.query(query, values);
    
    return new BoardPermission(result.rows[0]);
  }

  // Find permission by board and user
  static async findByBoardAndUser(boardId, userId) {
    const query = `
      SELECT * FROM board_permissions 
      WHERE board_id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [boardId, userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new BoardPermission(result.rows[0]);
  }

  // Find permissions by board
  static async findByBoard(boardId) {
    const query = `
      SELECT bp.*, u.first_name, u.last_name, u.email, u.avatar_url
      FROM board_permissions bp
      JOIN users u ON bp.user_id = u.id
      WHERE bp.board_id = $1
      ORDER BY bp.created_at ASC
    `;
    
    const result = await pool.query(query, [boardId]);
    return result.rows.map(row => new BoardPermission(row));
  }

  // Find permissions by user
  static async findByUser(userId) {
    const query = `
      SELECT bp.*, b.title as board_title
      FROM board_permissions bp
      JOIN boards b ON bp.board_id = b.id
      WHERE bp.user_id = $1
      ORDER BY bp.created_at ASC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => new BoardPermission(row));
  }

  // Update permission role
  async updateRole(newRole, updatedBy) {
    const query = `
      UPDATE board_permissions 
      SET role = $1, granted_by = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [newRole, updatedBy, this.id]);
    return new BoardPermission(result.rows[0]);
  }

  // Delete permission
  async delete() {
    const query = 'DELETE FROM board_permissions WHERE id = $1';
    await pool.query(query, [this.id]);
    return true;
  }

  // Delete permission by board and user
  static async deleteByBoardAndUser(boardId, userId) {
    const query = 'DELETE FROM board_permissions WHERE board_id = $1 AND user_id = $2';
    const result = await pool.query(query, [boardId, userId]);
    return result.rowCount > 0;
  }

  // Check if user has specific role on board
  static async hasRole(boardId, userId, role) {
    const query = `
      SELECT role FROM board_permissions 
      WHERE board_id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [boardId, userId]);
    
    if (result.rows.length === 0) {
      return false;
    }
    
    return result.rows[0].role === role;
  }

  // Get user's role on board
  static async getUserRole(boardId, userId) {
    // Check permissions table
    const permissionQuery = `
      SELECT role FROM board_permissions 
      WHERE board_id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(permissionQuery, [boardId, userId]);
    
    // If user has explicit permission, return it
    if (result.rows.length > 0) {
      return result.rows[0].role;
    }
    
    // If no explicit permission, check if board is public
    const { default: Board } = await import('./Board.js');
    const board = await Board.findById(boardId);
    
    if (board && board.is_public) {
      // Public boards grant viewer access to any authenticated user
      return 'viewer';
    }
    
    return null;
  }

  // Get users with specific role on board
  static async getUsersByRole(boardId, role) {
    const query = `
      SELECT bp.*, u.first_name, u.last_name, u.email, u.avatar_url
      FROM board_permissions bp
      JOIN users u ON bp.user_id = u.id
      WHERE bp.board_id = $1 AND bp.role = $2
      ORDER BY bp.created_at ASC
    `;
    
    const result = await pool.query(query, [boardId, role]);
    return result.rows.map(row => new BoardPermission(row));
  }

  // Count permissions by role for a board
  static async countByRole(boardId, role) {
    const query = `
      SELECT COUNT(*) as count
      FROM board_permissions 
      WHERE board_id = $1 AND role = $2
    `;
    
    const result = await pool.query(query, [boardId, role]);
    return parseInt(result.rows[0].count);
  }

  toJSON() {
    return {
      id: this.id,
      board_id: this.board_id,
      user_id: this.user_id,
      role: this.role,
      granted_by: this.granted_by,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default BoardPermission;
