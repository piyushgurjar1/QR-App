const express = require('express');
const adminController = require('../controllers/adminController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/users', authorize(['admin']), adminController.getAllUsers);

router.post('/users', authorize(['admin']), adminController.addUser);

module.exports = router;