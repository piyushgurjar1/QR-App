const adminService = require('../services/adminService');

const getAllCaretakers = async (req, res) => {
  try {
    const caretakers = await adminService.getAllCaretakers();
    res.status(200).json(caretakers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addCaretaker = async (req, res) => {
  try {
    const { username, password } = req.body;
    const caretaker = await adminService.addCaretaker(username, password);
    res.status(201).json(caretaker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllCaretakers, addCaretaker };