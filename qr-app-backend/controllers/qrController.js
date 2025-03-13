const Child = require('../models/Child');
const notificationService = require('../services/notificationService');
const { decodeQRCode } = require('../utils/qrUtils');

const scanQRCode = async (req, res) => {
  
  try {
    const { qrData } = req.body;
    // Decode the QR code asynchronously
    const username = await decodeQRCode(qrData); // Ensure you await the result
    console.log("username after decoding:", username);

    // Check if username is valid
    if (!username) {
      return res.status(400).json({ error: 'Invalid QR code data' });
    }

    // Find child by username
    const child = await Child.findByUsername(username);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    console.log(`Notification sent to ${child.parent_mail}: Your child is ready for pickup!`);

    // Send notification to parent
    // await notificationService.sendNotification(
    //   child.parent_mail,
    //   'Your child is ready for pickup!'
    // );

    res.status(200).json({ message: 'Notification sent to parent', child });
  } catch (err) {
    console.error('Error in scanQRCode:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { scanQRCode };