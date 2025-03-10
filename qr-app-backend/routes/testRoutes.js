const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Test database connection
router.get('/test-db', async (req, res) => {
  try {
    // Execute a simple query
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.status(200).json({ message: 'Database connection successful', result: rows[0].result });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

module.exports = router;