const db = require('../config/db');

class User {
  static async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM user WHERE username = ?', [username]);
    return rows[0];
  }

  static async create(username, password, role) {
    const [result] = await db.query(
      'INSERT INTO user (username, password, role) VALUES (?, ?, ?)',
      [username, password, role]
    );
    return { id: result.insertId, username, role };
  }
}

module.exports = User;