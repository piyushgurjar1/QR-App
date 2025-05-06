const express = require('express');
const childController = require('../controllers/childController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:id', authorize(['admin', 'teacher']), childController.getChildById);
router.get('/', authorize(['admin', 'teacher']), childController.getAllChildren);

module.exports = router;