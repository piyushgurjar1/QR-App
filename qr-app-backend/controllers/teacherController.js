const User = require('../models/User');

const getDetails = async (req, res) => {
  try {
    const username = req.user.username; // Get the username from the token
    console.log('Username from token:', username);
    // Fetch child details using the username
    const teacherDetails = await User.findByUsername(username);

    if (!teacherDetails) {
      return res.status(404).json({ error: 'No teacher found for this username' });
    }

    res.json(teacherDetails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teacher details: ' + err.message });
  }
};

module.exports = { getDetails };