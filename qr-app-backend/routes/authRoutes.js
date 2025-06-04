const express = require('express');
const { authorize } = require('../middleware/authMiddleware');
const {registerChild,login} = require('../controllers/authController');

const router = express.Router();
router.post('/register', authorize(['admin', 'teacher']), registerChild);

router.post('/login', login);

module.exports = router;