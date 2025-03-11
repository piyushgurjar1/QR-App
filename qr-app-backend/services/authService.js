const bcrypt = require('bcryptjs');
const { generateQRCode } = require('../utils/qrUtils');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const User = require('../models/User');
const Child = require('../models/Child');
const { JWT_SECRET } = require('../config/constants');

const registerChild = async (name, parent_mail, username, parent_contact, password) => {
  // Check if the uname already exists
  const existingUser = await User.findByUsername(username);
  const existingChild = await Child.findByUsername(username);

  if (existingUser || existingChild) {
    throw new Error('Username already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const qrCode = await generateQRCode(username);

  console.log('Inserting:', [name, parent_mail, username, parent_contact, password, qrCode]);
  const child = await Child.create(name, parent_mail, username, parent_contact, hashedPassword,qrCode);
  
  return { ...child, qrCode };
};

const loginUser = async (username, password) => {
  // Check user table first
  const user = await User.findByUsername(username);
  let role = 'parent';
  let userId = null;

  if (!user) {
    // If not found, check child_info table
    const child = await Child.findByUsername(username);
    if (!child) {
      throw new Error('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, child.password);
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }
    userId = child.id;
    role = 'parent'; // Child is treated as a parent
  } else {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }
    userId = user.id;
    role = user.role; // admin/caretaker
  }
  if (!userId) {
    throw new Error("User ID is undefined");
  }
  const token = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '1h' });

  return { role, token };
};

module.exports = { registerChild, loginUser };