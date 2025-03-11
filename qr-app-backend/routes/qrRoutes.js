const express = require('express');
const qrController = require('../controllers/qrController');

const router = express.Router();

router.post('/scan', qrController.scanQRCode);

module.exports = router;