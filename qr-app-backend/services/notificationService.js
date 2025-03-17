const admin = require('firebase-admin');
const { FIREBASE_SERVICE_ACCOUNT } = require('../config/constants');

admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_SERVICE_ACCOUNT),
});

/**
 * Send a push notification to a specific device
 * @param {string} deviceToken - The FCM token of the target device
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data to send with the notification (optional)
 */

const sendPushNotification = async (deviceToken, title, body, data = {}) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data, // Optional, only for custom data
      token: deviceToken,
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (err) {
    console.error('Failed to send notification:', err);
    throw new Error('Failed to send notification');
  }
};

module.exports = { sendPushNotification };