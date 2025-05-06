const db = require('../config/db');
const User = require('../models/User');

const getAllUsers = async (role) => {
    try {
      const query = role ? 'SELECT * FROM Users WHERE role = ?' : 'SELECT * FROM Users';
      const [rows] = await db.query(query, role ? [role] : []);
      return rows;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const getAllChilds = async () => {
    try {
      const query = `
        SELECT
          ci.name,
          latest.max_ts AS timestamp
        FROM (
          SELECT
            child_id,
            MAX(timestamp) AS max_ts
          FROM AttendanceLogs
          WHERE DATE(timestamp) = CURDATE()
          GROUP BY child_id
        ) AS latest
        JOIN AttendanceLogs AS al
          ON al.child_id = latest.child_id
         AND al.timestamp = latest.max_ts
         AND al.is_checkin = TRUE
        JOIN ChildInfo AS ci
          ON ci.id = latest.child_id;
      `;
  
      const [rows] = await db.query(query);
      return rows;
    } catch (err) {
      throw new Error(err.message);
    }
  };
  
const addUser = async (name, email, contact, username, password, role) => {
    try {
      const user = await User.create(name, email, contact, username, password, role);
      return user;
    } catch (err) {
      throw new Error(err.message);
    }
  };

module.exports = { getAllUsers, addUser, getAllChilds};