const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createSettlement } = require('../controllers/settlementController');

router.post('/settle', auth, createSettlement);

module.exports = router;