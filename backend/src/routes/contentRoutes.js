const express = require('express');
const router = express.Router();
const {
  generateContent,
  getSamplePosts,
  getTemplates,
  getHistory,
  deleteHistoryItem,
  getAiStatus
} = require('../controllers/contentController');

router.post('/generate', generateContent);
router.get('/samples', getSamplePosts);
router.get('/templates', getTemplates);
router.get('/history', getHistory);
router.delete('/history/:id', deleteHistoryItem);
router.get('/ai-status', getAiStatus);

module.exports = router;
