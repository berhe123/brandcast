const express = require('express');
const router = express.Router();
const { emailLogin, emailStart, emailVerify, google, me, authConfig } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.get('/config', authConfig);
router.post('/email/login', emailLogin);
router.post('/email/start', emailStart);   // legacy → instant login
router.post('/email/verify', emailVerify); // legacy → instant login
router.post('/google', google);
router.get('/me', requireAuth, me);

module.exports = router;
