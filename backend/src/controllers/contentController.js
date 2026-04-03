const { generateSocialContent, isRealApiKey } = require('../services/aiService');
const { samplePosts, contentTemplates, brandInfo } = require('../data/sampleData');
const { v4: uuidv4 } = require('uuid');

let contentHistory = [];

const generateContent = async (req, res, next) => {
  try {
    const {
      platform,
      topic,
      tone,
      contentType,
      targetAudience,
      language,
      includeHashtags,
      includeEmoji,
      customInstructions
    } = req.body;

    if (!platform || !topic) {
      return res.status(400).json({
        success: false,
        error: 'Platform and topic are required'
      });
    }

    if (topic.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Topic must be at least 3 characters long'
      });
    }

    const content = await generateSocialContent({
      platform,
      topic: topic.trim(),
      tone: tone || 'professional',
      contentType: contentType || 'post',
      targetAudience: targetAudience || 'general',
      language: language || 'english',
      includeHashtags: includeHashtags !== false,
      includeEmoji: includeEmoji !== false,
      customInstructions,
      brandInfo
    });

    const historyItem = {
      id: uuidv4(),
      platform,
      topic: topic.trim(),
      tone: tone || 'professional',
      contentType: contentType || 'post',
      language: language || 'english',
      content,
      createdAt: new Date().toISOString()
    };

    contentHistory.unshift(historyItem);
    if (contentHistory.length > 100) {
      contentHistory = contentHistory.slice(0, 100);
    }

    res.json({ success: true, data: historyItem });
  } catch (error) {
    next(error);
  }
};

const getSamplePosts = (req, res) => {
  const { platform } = req.query;
  let posts = samplePosts;
  if (platform && platform !== 'all') {
    posts = samplePosts.filter(p => p.platform.toLowerCase() === platform.toLowerCase());
  }
  res.json({ success: true, data: posts });
};

const getTemplates = (req, res) => {
  const { platform } = req.query;
  let templates = contentTemplates;
  if (platform && platform !== 'all') {
    templates = contentTemplates.filter(t =>
      t.platform.toLowerCase() === platform.toLowerCase() || t.platform === 'all'
    );
  }
  res.json({ success: true, data: templates });
};

const getHistory = (req, res) => {
  res.json({ success: true, data: contentHistory });
};

const deleteHistoryItem = (req, res) => {
  const { id } = req.params;
  const before = contentHistory.length;
  contentHistory = contentHistory.filter(item => item.id !== id);
  if (contentHistory.length === before) {
    return res.status(404).json({ success: false, error: 'Item not found' });
  }
  res.json({ success: true, message: 'Item deleted successfully' });
};

const getAiStatus = (req, res) => {
  res.json({
    success: true,
    data: {
      hasApiKey: isRealApiKey(),
      mode: isRealApiKey() ? 'claude' : 'demo',
      message: isRealApiKey()
        ? 'Claude AI is active'
        : 'Demo mode — add ANTHROPIC_API_KEY to backend/.env for Claude AI'
    }
  });
};

module.exports = {
  generateContent,
  getSamplePosts,
  getTemplates,
  getHistory,
  deleteHistoryItem,
  getAiStatus
};
