const childService = require('../services/childService');

const getChildById = async (req, res) => {
  try {
    const child = await childService.getChildById(req.params.id);
    res.status(200).json(child);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const getAllChildren = async (req, res) => {
  try {
    const children = await childService.getAllChildren();
    res.status(200).json(children);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getChildById, getAllChildren };