const db = require('../config/db');

class Child {
  static async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM child_info WHERE username = ?', [username]);
    return rows[0];
  }

  static async create(name, parent_mail, username, parent_contact, password, device_token) {
    const [result] = await db.query(
      'INSERT INTO child_info (name, parent_mail, username, parent_contact, password, device_token) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, parent_mail, username, parent_contact, password, device_token]
    );
    return { id: result.insertId, name, parent_mail, username, parent_contact, device_token };
  }
}

module.exports = Child;