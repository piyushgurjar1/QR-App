const Child = require('../models/Child');

const getChildById = async (childId) => {
  try {
    const child = await Child.findById(childId);
    if (!child) {
      throw new Error('Child not found');
    }
    return child;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getAllChildren = async () => {
  try {
    const [rows] = await db.query('SELECT * FROM child_info');
    return rows;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { getChildById, getAllChildren };