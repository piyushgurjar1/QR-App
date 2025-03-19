const admin = require('firebase-admin');
const { FIREBASE_SERVICE_ACCOUNT } = require('../config/constants');

// Check if Firebase is already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(FIREBASE_SERVICE_ACCOUNT),
  });
}

const sendPushNotification = async (deviceToken, title, body) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      token: deviceToken,
      // Add high priority to improve delivery chances
      android: {
        priority: "high",
      },
      // Add content_available for iOS to wake up the app
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log(deviceToken);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (err) {
    console.error('Failed to send notification:', err);
    if (err.code === 'messaging/invalid-registration') {
      console.log('Invalid device token');
      // Consider updating or removing the invalid token from your database
    } else if (err.code === 'messaging/registration-token-not-registered') {
      console.log('Device token not registered');
      // Consider updating or removing the unregistered token from your database
    } else {
      console.log('Unknown error:', err.message);
    }
    // Return the error instead of throwing it to prevent API disruption
    return { error: err.message };
  }
};

  
module.exports = { sendPushNotification };