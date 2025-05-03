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

const changePassword = async (req, res) => {
  try {
    const username = req.user.username;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is not there' });
    }

    const success = await Child.updatePassword(username, newPassword);
    if (success) {
      res.status(200).json({ message: 'Password updated successfully' });
    } else {
      res.status(400).json({ error: 'Failed to update password' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error updating password: ' + err.message });
  }
};

module.exports = { getChildDetails, changePassword };