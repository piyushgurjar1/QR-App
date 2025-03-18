const admin = require('firebase-admin');
const { FIREBASE_SERVICE_ACCOUNT } = require('../config/constants');

admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_SERVICE_ACCOUNT),
});

const sendPushNotification = async (deviceToken, title, body) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      token: deviceToken,
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (err) {
    console.error('Failed to send notification:', err);
    if (err.code === 'messaging/invalid-registration') {
      console.log('Invalid device token');
    } else if (err.code === 'messaging/registration-token-not-registered') {
      console.log('Device token not registered');
    } else {
      console.log('Unknown error:', err.message);
    }
    throw new Error('Failed to send notification');
  }
};
  
module.exports = { sendPushNotification };