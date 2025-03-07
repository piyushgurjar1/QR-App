const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST, 
  port: process.env.DB_PORT || 3306, 
  user: process.env.DB_USER, // RDS master username
  password: process.env.DB_PASSWORD, // RDS master password
  database: process.env.DB_NAME, // Database name
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on your needs
  queueLimit: 0,
});

module.exports = pool.promise();

