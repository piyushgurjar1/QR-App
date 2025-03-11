const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/caretakers', adminController.getAllCaretakers);

router.post('/caretakers', adminController.addCaretaker);

module.exports = router;