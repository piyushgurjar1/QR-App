const Child = require('../models/Child');
const {sendPushNotification} = require('../services/notificationService')
const scanQRCode = async (req, res) => {
  try {
    const { username, eventType } = req.body;
    console.log('Username:', username, 'Event Type:', eventType);

    // Check if username is valid
    if (!username) {
      return res.status(400).json({ error: 'Invalid QR code data' });
    }

    if(!eventType){
      return res.status(400).json({error: 'Missing event type'});
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

    let title = '';
    let message = '';

    if (eventType === 'checkin') {
      title = 'Child Checkin';
      message = `Your child ${child.name} has arrived at school safely.`;
    } else if (eventType === 'checkout') {
      title = 'Child Checkout';
      message = `Your child ${child.name} is ready for pickup!`;
    } else {
      return res.status(400).json({ error: 'Invalid event type' });
    }

    console.log(`Sending notification to parent with token: ${child.device_token}`);
    console.log(`Sending notification: ${title} - ${message}`);

    // Send notification to parent
    const notificationResult = await sendPushNotification(
      child.device_token,
      title,
      message
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