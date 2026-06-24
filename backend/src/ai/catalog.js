/**
 * AI Model Catalog
 * -----------------
 * The single source of truth describing every model the router can choose from.
 *
 * The router's job is QUALITY, not cost: for each marketing task it selects the
 * model (or pair of models, in hybrid mode) that produces the best content.
 * Each entry therefore carries capability metadata the router scores against the
 * task's requirements.
 *
 * `quality` and per-skill scores are normalised 0-10. `strengths` are capability
 * tags matched against task requirements. `cost`/`speed` are kept for display
 * only (so the UI can show trade-offs) — they do NOT drive routing.
 */

const MODELS = [
  // ─── Anthropic ─────────────────────────────────────────────────────────
  {
    id: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    label: 'Claude 3.5 Sonnet',
    envKey: 'ANTHROPIC_API_KEY',
    strengths: ['creative', 'long-form', 'brand-voice', 'nuance', 'storytelling', 'multilingual'],
    // Per-skill quality (0-10) the router weights against the task profile.
    skills: {
      creative: 9.6, hook: 9.2, persuasion: 9.0, longform: 9.5, brandVoice: 9.6,
      trend: 8.0, structure: 8.8, multilingual: 9.0, hashtags: 8.2,
    },
    languages: ['english', 'german', 'french', 'spanish', 'italian'],
    quality: 9.5,
    speed: 7,
    cost: { input: 0.003, output: 0.015 },
    blurb: 'Best-in-class for nuanced, on-brand storytelling and creative copy.',
  },
  {
    id: 'claude-3-5-haiku-20241022',
    provider: 'anthropic',
    label: 'Claude 3.5 Haiku',
    envKey: 'ANTHROPIC_API_KEY',
    strengths: ['fast', 'short-form', 'brand-voice', 'multilingual'],
    skills: {
      creative: 8.2, hook: 8.4, persuasion: 8.0, longform: 7.5, brandVoice: 8.6,
      trend: 7.8, structure: 8.2, multilingual: 8.4, hashtags: 8.0,
    },
    languages: ['english', 'german', 'french', 'spanish'],
    quality: 8,
    speed: 9.5,
    cost: { input: 0.0008, output: 0.004 },
    blurb: 'Fast and on-brand — great for quick captions and many variations.',
  },

  // ─── OpenAI ────────────────────────────────────────────────────────────
  {
    id: 'gpt-4o',
    provider: 'openai',
    label: 'GPT-4o',
    envKey: 'OPENAI_API_KEY',
    strengths: ['creative', 'trending', 'structured', 'long-form', 'multilingual', 'persuasion'],
    skills: {
      creative: 9.2, hook: 9.4, persuasion: 9.3, longform: 9.2, brandVoice: 8.8,
      trend: 9.5, structure: 9.2, multilingual: 9.0, hashtags: 9.0,
    },
    languages: ['english', 'german', 'french', 'spanish', 'italian', 'portuguese'],
    quality: 9.3,
    speed: 7.5,
    cost: { input: 0.005, output: 0.015 },
    blurb: 'Trend-aware all-rounder with punchy hooks and tight structure.',
  },
  {
    id: 'gpt-4o-mini',
    provider: 'openai',
    label: 'GPT-4o mini',
    envKey: 'OPENAI_API_KEY',
    strengths: ['fast', 'short-form', 'structured', 'trending'],
    skills: {
      creative: 7.8, hook: 8.6, persuasion: 8.2, longform: 7.4, brandVoice: 7.8,
      trend: 8.8, structure: 8.6, multilingual: 8.0, hashtags: 8.6,
    },
    languages: ['english', 'german', 'french', 'spanish'],
    quality: 7.8,
    speed: 9.5,
    cost: { input: 0.00015, output: 0.0006 },
    blurb: 'Snappy hooks and hashtags at speed — ideal for short posts.',
  },

  // ─── Google ────────────────────────────────────────────────────────────
  {
    id: 'gemini-1.5-pro',
    provider: 'gemini',
    label: 'Gemini 1.5 Pro',
    envKey: 'GEMINI_API_KEY',
    strengths: ['long-form', 'multilingual', 'structured', 'long-context', 'reasoning'],
    skills: {
      creative: 8.6, hook: 8.4, persuasion: 8.6, longform: 9.3, brandVoice: 8.4,
      trend: 8.6, structure: 9.4, multilingual: 9.6, hashtags: 8.4,
    },
    languages: ['english', 'german', 'french', 'spanish', 'italian', 'portuguese', 'japanese', 'chinese', 'arabic'],
    quality: 9,
    speed: 8,
    cost: { input: 0.00125, output: 0.005 },
    blurb: 'Unmatched multilingual reach and long-context for blog content.',
  },
  {
    id: 'gemini-1.5-flash',
    provider: 'gemini',
    label: 'Gemini 1.5 Flash',
    envKey: 'GEMINI_API_KEY',
    strengths: ['fast', 'short-form', 'multilingual', 'trending'],
    skills: {
      creative: 7.6, hook: 8.2, persuasion: 7.8, longform: 7.6, brandVoice: 7.6,
      trend: 9.0, structure: 8.4, multilingual: 9.2, hashtags: 8.6,
    },
    languages: ['english', 'german', 'french', 'spanish', 'japanese', 'chinese', 'arabic'],
    quality: 7.5,
    speed: 10,
    cost: { input: 0.000075, output: 0.0003 },
    blurb: 'Fast, trend-forward and broadly multilingual for short posts.',
  },

  // ─── DeepSeek ──────────────────────────────────────────────────────────
  {
    id: 'deepseek-chat',
    provider: 'deepseek',
    label: 'DeepSeek V3',
    envKey: 'DEEPSEEK_API_KEY',
    strengths: ['structured', 'short-form', 'persuasion', 'reasoning'],
    skills: {
      creative: 8.0, hook: 8.2, persuasion: 8.6, longform: 8.0, brandVoice: 7.8,
      trend: 8.0, structure: 9.0, multilingual: 7.8, hashtags: 8.0,
    },
    languages: ['english', 'german', 'chinese'],
    quality: 8.2,
    speed: 8,
    cost: { input: 0.00027, output: 0.0011 },
    blurb: 'Crisp, well-structured persuasive copy with strong logic.',
  },
  {
    id: 'deepseek-reasoner',
    provider: 'deepseek',
    label: 'DeepSeek R1',
    envKey: 'DEEPSEEK_API_KEY',
    strengths: ['reasoning', 'long-form', 'structured', 'analysis', 'strategy'],
    skills: {
      creative: 8.2, hook: 8.0, persuasion: 8.8, longform: 8.8, brandVoice: 8.0,
      trend: 8.0, structure: 9.2, multilingual: 7.6, hashtags: 7.6,
    },
    languages: ['english', 'german', 'chinese'],
    quality: 8.8,
    speed: 5.5,
    cost: { input: 0.00055, output: 0.00219 },
    blurb: 'Deep reasoning for strategy, campaign angles and complex briefs.',
  },
];

const PROVIDERS = {
  anthropic: { label: 'Anthropic', envKey: 'ANTHROPIC_API_KEY', color: '#d97757' },
  openai: { label: 'OpenAI', envKey: 'OPENAI_API_KEY', color: '#10a37f' },
  gemini: { label: 'Google Gemini', envKey: 'GEMINI_API_KEY', color: '#4285f4' },
  deepseek: { label: 'DeepSeek', envKey: 'DEEPSEEK_API_KEY', color: '#4d6bfe' },
};

const PLACEHOLDER_HINTS = ['your_', 'your-', 'placeholder', 'changeme', 'xxxx'];

/** True when an env var holds what looks like a real (non-placeholder) key. */
const hasRealKey = (envKey) => {
  const v = (process.env[envKey] || '').trim();
  if (v.length < 10) return false;
  const lower = v.toLowerCase();
  return !PLACEHOLDER_HINTS.some((h) => lower.includes(h));
};

/** Provider availability map, e.g. { anthropic: true, openai: false, ... }. */
const getProviderAvailability = () =>
  Object.fromEntries(
    Object.entries(PROVIDERS).map(([id, p]) => [id, hasRealKey(p.envKey)])
  );

/** A model is "live" when its provider has a real key; otherwise it runs mocked. */
const isModelLive = (model) => hasRealKey(model.envKey);

const getModelById = (id) => MODELS.find((m) => m.id === id);

module.exports = {
  MODELS,
  PROVIDERS,
  hasRealKey,
  getProviderAvailability,
  isModelLive,
  getModelById,
};
