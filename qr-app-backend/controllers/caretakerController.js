const User = require('../models/User');

const getDetails = async (req, res) => {
  try {
    const username = req.user.username; // Get the username from the token

    // Fetch child details using the username
    const caretakerDetails = await User.findByUsername(username);

    if (!caretakerDetails) {
      return res.status(404).json({ error: 'No caretaker found for this username' });
    }

    res.json(caretakerDetails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch caretaker details: ' + err.message });
  }
};

module.exports = { getDetails };