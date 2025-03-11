const mysql = require('mysql2/promise');
const fs = require('fs');

const pool = mysql.createPool({
  host: process.env.DB_HOST, 
  port: process.env.DB_PORT || '3306', 
  user: process.env.DB_USER, // RDS master username
  password: process.env.DB_PASSWORD, // RDS master password
  database: process.env.DB_NAME, 
  waitForConnections: true,
  connectionLimit: 10, 
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

module.exports = pool;