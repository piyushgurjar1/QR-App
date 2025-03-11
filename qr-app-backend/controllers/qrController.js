const Child = require('../models/Child');
const notificationService = require('../services/notificationService');

const scanQRCode = async (req, res) => {
  try {
    const { username } = req.body;

    // Find child by uname
    const child = await Child.findByUsername(username);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // notification to parent
    await notificationService.sendNotification(child.parent_mail, 'Your child is ready for pickup!');

    res.status(200).json({ message: 'Notification sent to parent', child });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { scanQRCode };