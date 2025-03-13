const express = require('express');
const router = express.Router();
const caretakerController = require('../controllers/caretakerController');
const { authorize } = require('../middleware/authMiddleware');

// Fetch child details for the caretaker dashboard
router.get('/dashboard', authorize(['caretaker']), caretakerController.getDetails);

module.exports = router;