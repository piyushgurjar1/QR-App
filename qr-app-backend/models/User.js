const db = require('../config/db');
const bcrypt = require('bcryptjs');
class User {
    static async findByUsername(username) {
      const [rows] = await db.query('SELECT * FROM user WHERE username = ?', [username]);
      return rows[0];
    }
  
    static async create(name, email, contact, username, password, role) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert the new user into the database
      const [result] = await db.query(
        'INSERT INTO user (name, email, contact, username, password, role) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, contact, username, hashedPassword, role]
      );
  
      return { id: result.insertId, name, email, contact, username, role };
    }
  
    static async comparePassword(password, hashedPassword) {
      return await bcrypt.compare(password, hashedPassword);
    }
  }
  
module.exports = User;