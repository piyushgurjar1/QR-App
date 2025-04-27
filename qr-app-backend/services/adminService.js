const db = require('../config/db');
const User = require('../models/User');

const getAllUsers = async (role) => {
    try {
      const query = role ? 'SELECT * FROM Users WHERE role = ?' : 'SELECT * FROM Users';
      const [rows] = await db.query(query, role ? [role] : []);
      return rows;
    } catch (err) {
      throw new Error(err.message);
    }
  };

const addUser = async (name, email, contact, username, password, role) => {
    try {
      const user = await User.create(name, email, contact, username, password, role);
      return user;
    } catch (err) {
      throw new Error(err.message);
    }
  };

module.exports = { getAllUsers, addUser };