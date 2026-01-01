const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, balanceController.addLog);
router.get('/', auth, balanceController.getLogs);

module.exports = router;