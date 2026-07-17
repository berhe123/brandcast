const express = require('express');
const router = express.Router();
const {
  generateContent,
  generateMonthly,
  researchBrand,
  getSamplePosts,
  getTemplates,
  getHistory,
  deleteHistoryItem,
  updateHistoryItem,
  getAiStatus,
  getModels
} = require('../controllers/contentController');
const { requireAuth } = require('../middleware/auth');

router.post('/generate', requireAuth, generateContent);
router.post('/monthly', requireAuth, generateMonthly);
router.post('/mcp/research', requireAuth, researchBrand);
router.get('/history', requireAuth, getHistory);
router.patch('/history/:id', requireAuth, updateHistoryItem);
router.delete('/history/:id', requireAuth, deleteHistoryItem);

// Public, read-only catalog/status endpoints.
router.get('/samples', getSamplePosts);
router.get('/templates', getTemplates);
router.get('/ai-status', getAiStatus);
router.get('/models', getModels);

module.exports = router;
