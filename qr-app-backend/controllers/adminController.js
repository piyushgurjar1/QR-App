const adminService = require('../services/adminService');


const getAllUsers = async (req, res) => {
    try {
      const role = req.query.role; 
      const users = await adminService.getAllUsers(role);
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

const getAllChilds = async (req, res) => {
    try {
      const users = await adminService.getAllChilds();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

const addUser = async (req, res) => {
    try {
      const { name, email, contact, username, password, role } = req.body;
      const user = await adminService.addUser(name, email, contact, username, password, role);
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
module.exports = { getAllUsers, addUser, getAllChilds};