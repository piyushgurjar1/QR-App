const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../config/constants');

const registerChild = async (name, parent_mail, username, parent_contact, password) => {
  // Check if the username already exists in either table
  const [existingUser] = await db.execute('SELECT * FROM user WHERE username = ?', [username]);
  const [existingChild] = await db.execute('SELECT * FROM child_info WHERE username = ?', [username]);

  if (existingUser.length > 0 || existingChild.length > 0) {
    throw new Error('Username already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await db.execute(
    'INSERT INTO child_info (name, parent_mail, username, parent_contact, password) VALUES (?, ?, ?, ?, ?)',
    [name, parent_mail, username, parent_contact, hashedPassword]
  );

  return { id: result.insertId, name, parent_mail, username, parent_contact };
};

const loginUser = async (username, password) => {
  // Check the user table first
  const [users] = await db.execute('SELECT * FROM user WHERE username = ?', [username]);
  let user = users[0];

  if (!user) {
    // If not found in the user table, check the child_info table
    const [children] = await db.execute('SELECT * FROM child_info WHERE username = ?', [username]);
    user = children[0];

    if (!user) {
      throw new Error('Invalid username or password');
    }
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid username or password');
  }

  // Determine the role
  const role = user.role || 'parent'; // If user.role is undefined, it's a parent

  // Generate a JWT token
  const token = jwt.sign({ id: user.id, role }, JWT_SECRET, { expiresIn: '1h' });

  return { role, token };
};

module.exports = { registerChild, loginUser };