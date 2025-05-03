const Child = require('../models/Child');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const db = require('../config/db');

const getChildDetails = async (req, res) => {
  try {
    const username = req.user.username; // Get the username from the token

    // Fetch child details using the username
    const childDetails = await Child.findByUsername(username);

    if (!childDetails) {
      return res.status(404).json({ error: 'No child found for this username' });
    }

    res.json(childDetails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch child details: ' + err.message });
  }
};

const changePassword = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Get token from header

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const username = decoded.username;
    console.log(username);
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is not there' });
    }

    const success = await Child.updatePassword(username, newPassword);
    if (success) {
      res.status(200).json({ message: 'Password updated successfully' });
    } else {
      res.status(400).json({ error: 'Failed to update password' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error updating password: ' + err.message });
  }
};

const getAttendanceHistory = async (req, res) => {
  try {
    const username = req.user.username;

    // Get child info by username
    const child = await Child.findByUsername(username);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Fetch attendance logs
    const [logs] = await db.query(
      'SELECT is_checkin, timestamp FROM AttendanceLogs WHERE child_id = ? ORDER BY timestamp DESC',
      [child.id]
    );

    res.status(200).json({ attendance: logs });
  } catch (err) {
    console.error('Error fetching attendance history:', err.message);
    res.status(500).json({ error: 'Server error while fetching attendance' });
  }
};

module.exports = { getChildDetails, changePassword, getAttendanceHistory };