const { generateSocialContent, getAiStatus: getMultiProviderStatus } = require('../services/aiService');
const { generateMonthlyPlan } = require('../services/monthlyPlanService');
const { researchBrandFromWebsite, mcpToBrandInfo } = require('../services/mcpBrandResearch');
const {
  gatherGenerationContext,
  contextToPromptBlock,
  resolveActiveConnections,
} = require('../services/modelContextProtocol');
const { samplePosts, contentTemplates } = require('../data/sampleData');
const { MODELS, PROVIDERS, isModelLive } = require('../ai/catalog');
const { content: contentStore, integrations } = require('../db/store');

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

    const brand = resolveBrand(brandInfo);

    // MCP is built-in: Marketing Context (brand website) + Model Context (CRM/DB/apps)
    // No Integrations page — connectors activate automatically.
    const saved = integrations.filter((i) => i.userId === req.user.id);
    const connections = resolveActiveConnections(saved, brand);
    const mcpChunks = await gatherGenerationContext(connections);
    const mcpPrompt = contextToPromptBlock(mcpChunks);
    if (mcpPrompt) {
      brand.customContext = `${brand.customContext || ''}${mcpPrompt}`.trim();
      const mkt = mcpChunks.find((c) => c.brandInfo);
      if (mkt?.brandInfo) {
        Object.assign(brand, {
          voice: brand.voice || mkt.brandInfo.voice,
          tagline: brand.tagline || mkt.brandInfo.tagline,
          values: brand.values?.length ? brand.values : mkt.brandInfo.values,
          industry: brand.industry || mkt.brandInfo.industry,
          audience: brand.audience || mkt.brandInfo.audience,
          mcp: mkt.brandInfo.mcp || brand.mcp,
        });
      }
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
        customInstructions: [customInstructions, brand.customContext].filter(Boolean).join('\n'),
        brandInfo: brand,
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
      live: result.live,
      mcpSources: mcpChunks.filter((c) => !c.error).map((c) => c.source),
    });

    res.json({
      success: true,
      data: {
        ...historyItem,
        mcp: {
          builtIn: true,
          sources: mcpChunks.filter((c) => !c.error).map((c) => ({
            source: c.source,
            protocol: c.protocol,
            summary: c.summary,
          })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const researchBrand = async (req, res, next) => {
  try {
    const { website, name, description } = req.body || {};
    if (!website || !String(website).trim()) {
      return res.status(400).json({ success: false, error: 'Website URL is required for MCP research' });
    }
    const mcp = await researchBrandFromWebsite(String(website).trim(), {
      name: name || '',
      description: description || '',
    });
    const brandInfo = mcpToBrandInfo(mcp, { name, description, website });
    res.json({ success: true, data: { mcp, brandInfo } });
  } catch (error) {
    next(error);
  }
};

const generateMonthly = async (req, res, next) => {
  try {
    const {
      goal,
      brandInfo,
      brand,
      mcp,
      language,
      includeHashtags,
      includeEmoji,
    } = req.body || {};

    const text = String(goal || '').trim();
    if (text.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Describe your monthly goal in more detail (e.g. coffee shop wanting more customers).',
      });
    }

    const resolved = resolveBrand(brandInfo);
    const saved = integrations.filter((i) => i.userId === req.user.id);
    const connections = resolveActiveConnections(saved, resolved);
    const mcpChunks = await gatherGenerationContext(connections);
    const mcpPrompt = contextToPromptBlock(mcpChunks);
    if (mcpPrompt) {
      resolved.customContext = mcpPrompt;
      const mkt = mcpChunks.find((c) => c.brandInfo);
      if (mkt?.brandInfo) Object.assign(resolved, mkt.brandInfo, { mcp: mkt.brandInfo.mcp });
    }

    const plan = await generateMonthlyPlan({
      goal: text,
      brandInfo: resolved,
      brand,
      mcp: mcp || resolved.mcp || brandInfo?.mcp || null,
      language: language || 'english',
      includeHashtags: includeHashtags !== false,
      includeEmoji: includeEmoji !== false,
    });

    contentStore.insert({
      userId: req.user.id,
      platform: 'monthly',
      topic: text.slice(0, 120),
      tone: 'mixed',
      contentType: 'monthly_plan',
      language: language || 'english',
      content: `Monthly plan · ${plan.postCount} posts`,
      routing: null,
      drafts: null,
      live: plan.posts?.some((p) => p.live) || false,
      monthlyPlan: {
        postCount: plan.postCount,
        mix: plan.mix,
        mcpUsed: plan.mcpUsed,
      },
    });

    res.json({ success: true, data: plan });
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

const updateHistoryItem = (req, res) => {
  const item = contentStore.find((c) => c.id === req.params.id);
  if (!item || item.userId !== req.user.id) {
    return res.status(404).json({ success: false, error: 'Item not found' });
  }
  const { topic, content, platform, tone } = req.body || {};
  const updates = {};
  if (typeof topic === 'string') updates.topic = topic.trim();
  if (typeof content === 'string') updates.content = content;
  if (typeof platform === 'string') updates.platform = platform;
  if (typeof tone === 'string') updates.tone = tone;
  const updated = contentStore.update(item.id, updates);
  res.json({ success: true, data: updated });
};

const getAiStatus = (req, res) => {
  res.json({ success: true, data: getMultiProviderStatus() });
};

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
  generateMonthly,
  researchBrand,
  getSamplePosts,
  getTemplates,
  getHistory,
  deleteHistoryItem,
  updateHistoryItem,
  getAiStatus,
  getModels
};
