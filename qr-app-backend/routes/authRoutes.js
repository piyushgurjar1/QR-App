const express = require('express');

const {registerChild,login} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerChild);

router.post('/login', login);

module.exports = router;