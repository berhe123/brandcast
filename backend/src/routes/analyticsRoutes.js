const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getAnalytics);

module.exports = router;
