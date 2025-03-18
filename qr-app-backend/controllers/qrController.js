const Child = require('../models/Child');
const {sendPushNotification} = require('../services/notificationService')
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
    if (!child.device_token) {
      return res.status(400).json({ error: 'Parent device token not found' });
    }

    console.log(`Sending notification to parent with token: ${child.device_token}`);

    // Send notification to parent
    const notificationResult = await sendPushNotification(
      child.device_token,
      'Child Pickup',
      `Your child ${child.name} is ready for pickup!`
    );

    // Check if there was an error but don't fail the API response
    if (notificationResult && notificationResult.error) {
      console.warn(`Notification might not have been delivered: ${notificationResult.error}`);
    }

    res.status(200).json({ 
      message: 'QR code scanned successfully', 
      notificationSent: !notificationResult.error,
      child 
    });
  } catch (err) {
    console.error('Error in scanQRCode:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { scanQRCode };