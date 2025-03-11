const db = require('../config/db');

const getAllCaretakers = async () => {
  try {
    const [rows] = await db.query('SELECT * FROM user WHERE role = "caretaker"');
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
};

const addCaretaker = async (username, password) => {
  try {
    const [result] = await db.query(
      'INSERT INTO user (username, password, role) VALUES (?, ?, "caretaker")',
      [username, password]
    );
    return { id: result.insertId, username, role: 'caretaker' };
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { getAllCaretakers, addCaretaker };