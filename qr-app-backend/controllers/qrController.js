const Child = require('../models/Child');
const { sendPushNotification } = require('../services/notificationService');

const scanQRCode = async (req, res) => {
  try {
    const { username } = req.body;
    console.log('Username after decoding:', username);

    // Check if username is valid
    if (!username) {
      return res.status(400).json({ error: 'Invalid QR code data' });
    }

    // Find child by username
    const child = await Child.findByUsername(username);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Check if the parent's device token is available
    if (!child.parent_device_token) {
      return res.status(400).json({ error: 'Parent device token not found' });
    }

    console.log(`Sending notification to parent with token: ${child.parent_device_token}`);

    // Send notification to parent
    await sendPushNotification(
      child.parent_device_token, // Parent's device token
      'Child Pickup', // Notification title
      `Your child ${child.name} is ready for pickup!` // Notification body
    );

    res.status(200).json({ message: 'Notification sent to parent', child });
  } catch (err) {
    console.error('Error in scanQRCode:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { scanQRCode };