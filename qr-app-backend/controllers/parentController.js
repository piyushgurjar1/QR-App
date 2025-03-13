const Child = require('../models/Child');

const getChildDetails = async (req, res) => {
  try {
    const username = req.user.username; // Get the username from the token

    // Fetch child details using the username
    const childDetails = await Child.findByUsername(username);

    if (!childDetails) {
      return res.status(404).json({ error: 'No child found for this username' });
    }

    res.json(childDetails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch child details: ' + err.message });
  }
};

module.exports = { getChildDetails };