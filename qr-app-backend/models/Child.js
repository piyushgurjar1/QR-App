const db = require('../config/db');
const bcrypt = require('bcryptjs');

class Child {
  static async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM ChildInfo WHERE username = ?', [username]);
    return rows[0];
  }

  static async findById(childId) {
    const [rows] = await db.query('SELECT * FROM ChildInfo WHERE id = ?', [childId]);
    return rows[0];
  }

  static async create(name, parent_mail, username, parent_contact, password, device_token) {
    try {
      const [result] = await db.query(
        'INSERT INTO ChildInfo (name, parent_mail, username, parent_contact, password, device_token) VALUES (?, ?, ?, ?, ?, ?)',
        [name, parent_mail, username, parent_contact, password, device_token]
      );
      return { id: result.insertId, name, parent_mail, username, parent_contact, device_token };
    } catch (error) {
      console.error('Error in Child.create:', error.message);
      throw error;
    }
  }

  static async updatePassword(username, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const [result] = await db.query(
        'UPDATE ChildInfo SET password = ? WHERE username = ?',
        [hashedPassword, username]
      );
      console.log("Inside update pswd func success");
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating password:', error.message);
      throw error;
    }
  }
}

module.exports = Child;
