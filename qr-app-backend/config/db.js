const mysql = require('mysql2/promise');
const fs = require('fs');

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "*****" : "(empty)");
console.log("DB_NAME:", process.env.DB_NAME);

const pool = mysql.createPool({
  host: process.env.DB_HOST, 
  port: process.env.DB_PORT || '3306', 
  user: process.env.DB_USER, // RDS master username
  password: process.env.DB_PASSWORD, // RDS master password
  database: process.env.DB_NAME, // Database name
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on your needs
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Export the pool
module.exports = pool;