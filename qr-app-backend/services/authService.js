const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const User = require('../models/User');
const Child = require('../models/Child');
const { JWT_SECRET } = require('../config/constants');

const registerChild = async (name, parent_mail, username, parent_contact, password) => {
  try {
    // Check if the username already exists
    const existingUser = await User.findByUsername(username);
    const existingChild = await Child.findByUsername(username);
    if (existingUser || existingChild) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Inserting:', [name, parent_mail, username, parent_contact, password, null]);

    // Insert the new child record
    const child = await Child.create(name, parent_mail, username, parent_contact, hashedPassword, null);
    
    return { ...child };
  } catch (error) {
    console.error('Registration failed:', error.message);
    throw new Error('Registration failed: ' + error.message);
  }
};

const loginUser = async (username, password, deviceToken) => {
  // Check the user table first
  console.log('Debug logs  check');
  const user = await User.findByUsername(username);
  console.log("HII");

  let role = 'parent';
  if (!user) {
    // If not found in the user table, check the ChildInfo table
    const child = await Child.findByUsername(username);
    if (!child) {
      throw new Error('Invalid username or password');
    }

    console.log('🔍 Comparing password for child...');
    console.log('Entered password:', password);
    console.log('Stored hash:', child.password);

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, child.password);
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    role = 'parent'; // Child is treated as a parent

    // Update the parent's device token in the database
    await db.query('UPDATE ChildInfo SET device_token = ? WHERE username = ?', [deviceToken, username]);
  } else {
    // Compare the password for admin/caretaker
    console.log('👨‍🏫 User found:', user);
    console.log('🔍 Comparing password for user...');
    console.log('Entered password:', password);
    console.log('Stored hash:', user.password);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Incorrect password for user');
      throw new Error('Invalid username or password');
    }
    role = user.role; // admin or caretaker
  }

  // Generate a JWT token
  const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: '1h' });

  return { role, token };
};

module.exports = { registerChild, loginUser };