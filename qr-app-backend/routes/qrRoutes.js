const express = require('express');
const qrController = require('../controllers/qrController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/scan', authorize(['admin','teacher']), qrController.scanQRCode);

module.exports = router;