const QRCode = require('qrcode');
const jsQR = require('jsqr');
const sharp = require('sharp');


const decodeQRCode = async (qrData) => {
  try {
      const base64String = qrData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64String, 'base64');

      // Convert image to raw pixel data using Sharp
      const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });

      // Decode QR code using jsQR
      const decodedQR = jsQR(data, info.width, info.height);
      if (!decodedQR) {
          throw new Error('QR code not found in the image.');
      }

      return decodedQR.data;
  } catch (err) {
      throw new Error(`Failed to decode QR code: ${err.message}`);
  }
};

module.exports = { decodeQRCode };