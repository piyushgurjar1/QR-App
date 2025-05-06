const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authorize } = require('../middleware/authMiddleware');

// Fetch child details for the teacher dashboard
router.get('/dashboard', authorize(['teacher']), teacherController.getDetails);

module.exports = router; 