module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key',
  FIREBASE_SERVICE_ACCOUNT: JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')),
};
