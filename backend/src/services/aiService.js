/**
 * AI Service — Orchestrator
 * --------------------------
 * Turns a marketing brief into finished content using the AI Model Router:
 *
 *   1. route(task, mode) decides the best single model — or, in hybrid mode, the
 *      best complementary PAIR plus a synthesiser.
 *   2. single  → generate with the chosen model.
 *      hybrid  → generate two drafts in parallel, then fuse them into one
 *                best-of-both result.
 *
 * Returns rich metadata so the UI can show *which* models ran, *why* they were
 * chosen, and (for hybrid) both source drafts alongside the merged output.
 */

const { route } = require('../ai/router');
const { generate, fuse } = require('../ai/adapters');
const { getProviderAvailability, MODELS, isModelLive } = require('../ai/catalog');

const slim = (m) => ({ id: m.id, label: m.label, provider: m.provider, quality: m.quality, live: isModelLive(m) });

/**
 * @param {object} params  the marketing brief (platform, topic, tone, …)
 * @param {object} [opts]   { mode: 'auto' | 'single' | 'hybrid' }
 * @returns {Promise<{content,routing,drafts,live}>}
 */
const generateSocialContent = async (params, opts = {}) => {
  const mode = opts.mode || 'auto';
  const task = {
    platform: params.platform,
    contentType: params.contentType,
    language: params.language,
    tone: params.tone,
  };

  const decision = route(task, mode);

  // ── Single-model path ────────────────────────────────────────────────────
  if (decision.mode === 'single') {
    const { text, live } = await generate(decision.primary, params);
    return {
      content: text,
      live,
      routing: {
        mode: 'single',
        topSkills: decision.topSkills,
        rationale: decision.rationale,
        score: decision.score,
        primary: slim(decision.primary),
        alternatives: decision.alternatives,
      },
      drafts: [{ model: slim(decision.primary), text, live }],
    };
  }

  // ── Hybrid path: two drafts in parallel, then fuse ─────────────────────────
  const [a, b] = await Promise.all([
    generate(decision.primary, params),
    generate(decision.partner, params),
  ]);
  const fused = await fuse(decision.synthesizer, a.text, b.text, params);

  return {
    content: fused.text,
    live: a.live || b.live || fused.live,
    routing: {
      mode: 'hybrid',
      topSkills: decision.topSkills,
      rationale: decision.rationale,
      complementarity: decision.complementarity,
      primary: slim(decision.primary),
      partner: slim(decision.partner),
      synthesizer: slim(decision.synthesizer),
      alternatives: decision.alternatives,
    },
    drafts: [
      { model: slim(decision.primary), text: a.text, live: a.live, role: 'primary' },
      { model: slim(decision.partner), text: b.text, live: b.live, role: 'partner' },
    ],
  };
};

/** Multi-provider status for the UI. */
const getAiStatus = () => {
  const availability = getProviderAvailability();
  const liveProviders = Object.entries(availability).filter(([, v]) => v).map(([k]) => k);
  return {
    providers: availability,
    liveCount: liveProviders.length,
    totalProviders: Object.keys(availability).length,
    totalModels: MODELS.length,
    mode: liveProviders.length ? 'live' : 'demo',
    message: liveProviders.length
      ? `${liveProviders.length}/${Object.keys(availability).length} AI providers live · ${MODELS.length} models available`
      : `Demo mode — add provider API keys to backend/.env to go live. ${MODELS.length} models simulated.`,
  };
};

// Back-compat: some callers still import isRealApiKey.
const isRealApiKey = () => getProviderAvailability().anthropic;

module.exports = { generateSocialContent, getAiStatus, isRealApiKey };
