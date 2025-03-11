const express = require('express');
const childController = require('../controllers/childController');
const { authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:id', authorize(['admin', 'caretaker']), childController.getChildById);
router.get('/', authorize(['admin', 'caretaker']), childController.getAllChildren);

module.exports = router;