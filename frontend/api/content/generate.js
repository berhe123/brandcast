const { generateSocialContent, isRealApiKey } = require('../_lib/aiService');
const { brandInfo } = require('../_lib/sampleData');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

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
      return res.status(400).json({ success: false, error: 'Platform and topic are required' });
    }

    if (topic.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Topic must be at least 3 characters long' });
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

    res.json({ success: true, data: historyItem });
  } catch (error) {
    console.error('[generate] Error:', error.message);
    if (error.status) {
      return res.status(error.status).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message || 'An unexpected error occurred. Please try again.' });
  }
};
