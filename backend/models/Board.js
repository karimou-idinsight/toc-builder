import pool from '../config/database.js';

class Board {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.owner_id = data.owner_id;
    this.is_public = data.is_public;
    this.settings = data.settings || {};
    
    // Parse list_ids - could be array or string (JSONB)
    const listIds = data.list_ids;
    if (typeof listIds === 'string') {
      this.list_ids = JSON.parse(listIds);
    } else if (Array.isArray(listIds)) {
      this.list_ids = listIds;
    } else {
      this.list_ids = [];
    }
    
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new board
  static async create(boardData) {
    const { title, description, owner_id, is_public = false, settings = {} } = boardData;
    
    const query = `
      INSERT INTO boards (title, description, owner_id, is_public, settings)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [title, description, owner_id, is_public, JSON.stringify(settings)];
    const result = await pool.query(query, values);
    
    const board = new Board(result.rows[0]);
    
    // Add owner as owner permission
    const { default: BoardPermission } = await import('./BoardPermission.js');
    await BoardPermission.create({
      board_id: board.id,
      user_id: owner_id,
      role: 'owner'
    });
    
    return board;
  }

  // Find board by ID
  static async findById(id) {
    const query = 'SELECT * FROM boards WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const boardData = result.rows[0];
    boardData.settings = typeof boardData.settings === 'string' 
      ? JSON.parse(boardData.settings) 
      : boardData.settings;
    
    return new Board(boardData);
  }

  // Find boards by owner
  static async findByOwner(ownerId) {
    const query = 'SELECT * FROM boards WHERE owner_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [ownerId]);
    
    return result.rows.map(row => {
      row.settings = typeof row.settings === 'string' 
        ? JSON.parse(row.settings) 
        : row.settings;
      return new Board(row);
    });
  }

  // Find public boards
  static async findPublic(limit = 20, offset = 0) {
    const query = `
      SELECT b.*, u.first_name, u.last_name, u.avatar_url
      FROM boards b
      JOIN users u ON b.owner_id = u.id
      WHERE b.is_public = true
      ORDER BY b.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    
    return result.rows.map(row => {
      row.settings = typeof row.settings === 'string' 
        ? JSON.parse(row.settings) 
        : row.settings;
      return {
        ...new Board(row),
        owner: {
          first_name: row.first_name,
          last_name: row.last_name,
          avatar_url: row.avatar_url
        }
      };
    });
  }

  // Find boards user has access to
  static async findByUserAccess(userId) {
    const query = `
      SELECT DISTINCT 
        b.*, 
        bp.role,
        (SELECT COUNT(DISTINCT user_id) FROM board_permissions WHERE board_id = b.id) as collaborator_count
      FROM boards b
      LEFT JOIN board_permissions bp ON b.id = bp.board_id
      WHERE b.owner_id = $1 OR bp.user_id = $1
      ORDER BY b.updated_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    
    return result.rows.map(row => {
      row.settings = typeof row.settings === 'string' 
        ? JSON.parse(row.settings) 
        : row.settings;
      const board = new Board(row);
      return {
        ...board.toJSON(),
        role: row.role || 'owner',
        name: board.title, // Add name field for frontend compatibility
        collaborator_count: parseInt(row.collaborator_count) || 0
      };
    });
  }

  // Update board
  async update(updateData) {
    const allowedFields = ['title', 'description', 'is_public', 'settings', 'list_ids'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        if (key === 'settings' || key === 'list_ids') {
          updates.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          updates.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(this.id);

    const query = `
      UPDATE boards 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    const boardData = result.rows[0];
    boardData.settings = typeof boardData.settings === 'string' 
      ? JSON.parse(boardData.settings) 
      : boardData.settings;
    boardData.list_ids = typeof boardData.list_ids === 'string'
      ? JSON.parse(boardData.list_ids)
      : boardData.list_ids;
    
    return new Board(boardData);
  }

  // Delete board
  async delete() {
    const query = 'DELETE FROM boards WHERE id = $1';
    await pool.query(query, [this.id]);
    return true;
  }

  // Check if user has permission
  async hasPermission(userId, requiredRole) {
    // Owner always has all permissions
    if (this.owner_id === userId) {
      return true;
    }

    // Check user's role on this board
    const query = `
      SELECT role FROM board_permissions 
      WHERE board_id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [this.id, userId]);
    
    if (result.rows.length === 0) {
      return false;
    }

    const userRole = result.rows[0].role;
    
    // Define role hierarchy
    const roleHierarchy = {
      'owner': 4,
      'contributor': 3,
      'reviewer': 2,
      'viewer': 1
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  // Get board permissions
  async getPermissions() {
    const query = `
      SELECT bp.*, u.first_name, u.last_name, u.email, u.avatar_url
      FROM board_permissions bp
      JOIN users u ON bp.user_id = u.id
      WHERE bp.board_id = $1
      ORDER BY bp.created_at ASC
    `;
    
    const result = await pool.query(query, [this.id]);
    return result.rows;
  }

  // Get board with owner info
  async withOwner() {
    const query = `
      SELECT b.*, u.first_name, u.last_name, u.email, u.avatar_url
      FROM boards b
      JOIN users u ON b.owner_id = u.id
      WHERE b.id = $1
    `;
    
    const result = await pool.query(query, [this.id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    row.settings = typeof row.settings === 'string' 
      ? JSON.parse(row.settings) 
      : row.settings;
    
    return {
      ...new Board(row),
      owner: {
        id: row.owner_id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        avatar_url: row.avatar_url
      }
    };
  }

  // Get full board data with lists, nodes, and edges
  async getFullBoardData() {
    const { default: BoardList } = await import('./BoardList.js');
    const { default: BoardNode } = await import('./BoardNode.js');
    const { default: BoardEdge } = await import('./BoardEdge.js');
    const { default: BoardNodeComment } = await import('./BoardNodeComment.js');
    const { default: BoardEdgeComment } = await import('./BoardEdgeComment.js');

    // Get all lists for this board
    const lists = await BoardList.findByIds(this.list_ids);
    
    // Collect all node IDs from all lists
    const allNodeIds = lists.reduce((acc, list) => {
      return [...acc, ...list.node_ids];
    }, []);
    
    // Get all nodes
    const nodes = await BoardNode.findByIds(allNodeIds);
    
    // Get all edges for these nodes
    const edges = await BoardEdge.findByNodes(allNodeIds);
    
    // Get all comments for nodes
    const nodeComments = await BoardNodeComment.findByNodeIds(allNodeIds);
    
    // Get all comments for edges
    const edgeIds = edges.map(e => e.id);
    const edgeComments = await BoardEdgeComment.findByEdgeIds(edgeIds);
    
    return {
      ...this.toJSON(),
      lists: lists.map(l => l.toJSON()),
      nodes: nodes.map(n => n.toJSON()),
      edges: edges.map(e => e.toJSON()),
      nodeComments: nodeComments.map(c => c.toJSON()),
      edgeComments: edgeComments.map(c => c.toJSON())
    };
  }

  // Add list to board
  async addList(listId) {
    const list_ids = [...this.list_ids, listId];
    return this.update({ list_ids });
  }

  // Remove list from board
  async removeList(listId) {
    const list_ids = this.list_ids.filter(id => id !== listId);
    return this.update({ list_ids });
  }

  // Reorder lists
  async reorderLists(list_ids) {
    return this.update({ list_ids });
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      owner_id: this.owner_id,
      is_public: this.is_public,
      settings: this.settings,
      list_ids: this.list_ids,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}


export default Board;
