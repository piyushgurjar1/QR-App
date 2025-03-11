const db = require('../config/db');

class Child {
  static async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM child_info WHERE username = ?', [username]);
    return rows[0];
  }

  static async create(name, parent_mail, username, parent_contact, password, qrCode) {
    const [result] = await db.query(
      'INSERT INTO child_info (name, parent_mail, username, parent_contact, password,qr_code) VALUES (?, ?, ?, ?, ?, ?)',
      [name, parent_mail, username, parent_contact, password, qrCode]
    );
    return { id: result.insertId, name, parent_mail, username, parent_contact,qrCode };
  }
}

module.exports = Child;