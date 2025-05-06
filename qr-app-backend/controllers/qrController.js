const db = require('../config/db');
const Child = require('../models/Child');
const { sendPushNotification } = require('../services/notificationService');

const scanQRCode = async (req, res) => {
  try {
    const { username, eventType } = req.body;
    console.log('Username:', username, 'Event Type:', eventType);

    if (!username) {
      return res.status(400).json({ error: 'Invalid QR code data' });
    }

    if (!eventType || !['checkin', 'checkout'].includes(eventType)) {
      return res.status(400).json({ error: 'Invalid or missing event type' });
    }

    const child = await Child.findByUsername(username);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    if (!child.device_token) {
      return res.status(400).json({ error: 'Parent device token not found' });
    }

    let title = '';
    let message = '';
    const isCheckin = eventType === 'checkin';

    if (isCheckin) {
      title = 'Child Checkin';
      message = `Your child ${child.name} has arrived at school safely.`;
    } else {
      title = 'Child Checkout';
      message = `Your child ${child.name} is ready for pickup!`;
    }

    console.log(`Sending notification to parent with token: ${child.device_token}`);
    console.log(`Sending notification: ${title} - ${message}`);

    const notificationResult = await sendPushNotification(
      child.device_token,
      title,
      message
    );

    if (notificationResult && notificationResult.error) {
      console.warn(`Notification might not have been delivered: ${notificationResult.error}`);
    }

    const timestamp = new Date();
    
    // Insert into AttendanceLogs table
    await db.query(
      'INSERT INTO AttendanceLogs (child_id, is_checkin, timestamp) VALUES (?, ?, ?)',
      [child.id, isCheckin, timestamp]
    );

    res.status(200).json({ 
      message: 'QR code scanned and attendance logged successfully', 
      notificationSent: !notificationResult.error,
      child 
    });

  } catch (err) {
    console.error('Error in scanQRCode:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { scanQRCode };
