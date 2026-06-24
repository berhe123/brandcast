const { generateSocialContent, getAiStatus: getMultiProviderStatus } = require('../services/aiService');
const { samplePosts, contentTemplates } = require('../data/sampleData');
const { MODELS, PROVIDERS, isModelLive } = require('../ai/catalog');
const { content: contentStore } = require('../db/store');

// Generic brand context used when the request doesn't supply one. The product
// is brand-agnostic — real content is driven by the selected brand's info.
const GENERIC_BRAND = {
  name: 'the brand', description: '', website: '', voice: 'clear, engaging and on-brand',
  tagline: '', values: [],
};
const resolveBrand = (b) => (b && b.name ? { ...GENERIC_BRAND, ...b } : GENERIC_BRAND);

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
      customInstructions,
      routingMode,
      brandInfo
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

    const result = await generateSocialContent(
      {
        platform,
        topic: topic.trim(),
        tone: tone || 'professional',
        contentType: contentType || 'post',
        targetAudience: targetAudience || 'general',
        language: language || 'english',
        includeHashtags: includeHashtags !== false,
        includeEmoji: includeEmoji !== false,
        customInstructions,
        brandInfo: resolveBrand(brandInfo)
      },
      { mode: routingMode || 'auto' }
    );

    const historyItem = contentStore.insert({
      userId: req.user.id,
      platform,
      topic: topic.trim(),
      tone: tone || 'professional',
      contentType: contentType || 'post',
      language: language || 'english',
      content: result.content,
      routing: result.routing,
      drafts: result.drafts,
      live: result.live
    });

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
  const items = contentStore.filter((c) => c.userId === req.user.id).slice(0, 100);
  res.json({ success: true, data: items });
};

const deleteHistoryItem = (req, res) => {
  const item = contentStore.find((c) => c.id === req.params.id);
  if (!item || item.userId !== req.user.id) {
    return res.status(404).json({ success: false, error: 'Item not found' });
  }
  contentStore.remove(item.id);
  res.json({ success: true, message: 'Item deleted successfully' });
};

const getAiStatus = (req, res) => {
  res.json({ success: true, data: getMultiProviderStatus() });
};

// Full catalog of routable models + their providers, for the "AI Router" UI.
const getModels = (req, res) => {
  res.json({
    success: true,
    data: {
      providers: Object.entries(PROVIDERS).map(([id, p]) => ({ id, ...p })),
      models: MODELS.map((m) => ({
        id: m.id,
        provider: m.provider,
        label: m.label,
        strengths: m.strengths,
        quality: m.quality,
        speed: m.speed,
        blurb: m.blurb,
        live: isModelLive(m)
      }))
    }
  });
};

module.exports = {
  generateContent,
  getSamplePosts,
  getTemplates,
  getHistory,
  deleteHistoryItem,
  getAiStatus,
  getModels
};
