const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { authorize } = require('../middleware/authMiddleware');

// Fetch child details for the parent dashboard
router.get('/dashboard', authorize(['parent']), parentController.getChildDetails);
router.get('/history', authorize(['parent']), parentController.getAttendanceHistory);
router.post('/password', authorize(['parent']), parentController.changePassword);

module.exports = router;