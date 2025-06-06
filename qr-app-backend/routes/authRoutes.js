const express = require('express');
const { authorize } = require('../middleware/authMiddleware');
const {registerChild,login, registerChildBulk} = require('../controllers/authController');

const router = express.Router();
router.post('/register', authorize(['admin', 'teacher']), registerChild);
router.post('/registerBulk', authorize(['admin', 'teacher']), registerChildBulk);

router.post('/login', login);

module.exports = router;