const express = require('express');
const router = express.Router();
const { emailStart, emailVerify, google, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/email/start', emailStart);
router.post('/email/verify', emailVerify);
router.post('/google', google);
router.get('/me', requireAuth, me);

module.exports = router;
