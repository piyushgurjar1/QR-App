const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST, 
  port: process.env.DB_PORT || '3306', 
  user: process.env.DB_USER, // RDS master username
  password: process.env.DB_PASSWORD, // RDS master password
  database: process.env.DB_NAME, // Database name
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on your needs
  queueLimit: 0,
  ssl:false,
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Successfully connected to the database');
    connection.release();
  }
});

// Export the pool
module.exports = pool.promise();