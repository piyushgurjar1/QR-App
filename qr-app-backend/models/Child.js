const db = require('../config/db');

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
      throw error; // Re-throw the error to handle it in the calling function
    }
  }
}

module.exports = Child;