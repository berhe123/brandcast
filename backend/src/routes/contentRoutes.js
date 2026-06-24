const express = require('express');
const router = express.Router();
const {
  generateContent,
  getSamplePosts,
  getTemplates,
  getHistory,
  deleteHistoryItem,
  getAiStatus,
  getModels
} = require('../controllers/contentController');
const { requireAuth } = require('../middleware/auth');

// Generating and reading personal history require a signed-in user.
router.post('/generate', requireAuth, generateContent);
router.get('/history', requireAuth, getHistory);
router.delete('/history/:id', requireAuth, deleteHistoryItem);

// Public, read-only catalog/status endpoints.
router.get('/samples', getSamplePosts);
router.get('/templates', getTemplates);
router.get('/ai-status', getAiStatus);
router.get('/models', getModels);

module.exports = router;
