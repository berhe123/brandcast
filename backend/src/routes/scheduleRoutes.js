const express = require('express');
const router = express.Router();
const { createScheduled, listScheduled, updateScheduled, publishNow, deleteScheduled } = require('../controllers/scheduleController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.post('/', createScheduled);
router.get('/', listScheduled);
router.patch('/:id', updateScheduled);
router.post('/:id/publish', publishNow);
router.delete('/:id', deleteScheduled);

module.exports = router;
