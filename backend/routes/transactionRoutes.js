const express = require('express');

const router = express.Router({ mergeParams: true });
const auth = require('../middleware/authMiddleware');
const { addTransaction } = require('../controllers/transactionController');

router.post('/', auth, addTransaction);

module.exports = router;