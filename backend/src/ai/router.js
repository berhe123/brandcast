/**
 * AI Model Router
 * ----------------
 * Selects the best AI model — or the best *pair* of models — for a given
 * marketing task, optimising purely for OUTPUT QUALITY.
 *
 *   • single mode  → score every model against the task's skill profile and
 *                    pick the highest scorer.
 *   • hybrid mode  → pick the top model, then the most COMPLEMENTARY partner
 *                    (the one that best covers the top model's relative weak
 *                    spots), so fusing the two yields content better than
 *                    either model alone. A synthesiser model is nominated to
 *                    merge the two drafts into one best-of-both result.
 *
 * Every decision is fully explainable: the router returns the skill profile it
 * derived, per-model scores, the winning skills, a human-readable rationale and
 * the ranked alternatives — so the UI can show judges *why* it chose what it did.
 */

const { MODELS, getModelById } = require('./catalog');

// All skills the catalog scores. Weights for a task are expressed over these.
const SKILLS = ['creative', 'hook', 'persuasion', 'longform', 'brandVoice', 'trend', 'structure', 'multilingual', 'hashtags'];

const SKILL_LABELS = {
  creative: 'creativity',
  hook: 'scroll-stopping hooks',
  persuasion: 'persuasive selling',
  longform: 'long-form depth',
  brandVoice: 'brand-voice fidelity',
  trend: 'trend awareness',
  structure: 'structure & clarity',
  multilingual: 'multilingual fluency',
  hashtags: 'hashtag craft',
};

// Base skill weighting per platform. Higher = matters more for that channel.
const PLATFORM_PROFILES = {
  twitter:   { hook: 3, trend: 2.5, creative: 1.5, hashtags: 1, structure: 1, brandVoice: 1 },
  tiktok:    { hook: 3, trend: 3, creative: 2, hashtags: 1.5, brandVoice: 1 },
  instagram: { hook: 2.5, creative: 2.5, hashtags: 2, brandVoice: 1.5, trend: 1.5 },
  facebook:  { brandVoice: 2.5, persuasion: 2, creative: 2, hook: 1.5, structure: 1 },
  linkedin:  { persuasion: 2.5, structure: 2.5, longform: 2, brandVoice: 2, creative: 1 },
};

// Additional weighting per content type (added on top of the platform profile).
const CONTENT_TYPE_PROFILES = {
  promotion:    { persuasion: 2, hook: 1 },
  story:        { creative: 2, brandVoice: 1.5, longform: 1 },
  announcement: { structure: 1.5, hook: 1 },
  engagement:   { hook: 1.5, creative: 1 },
  blog:         { longform: 3, structure: 2.5, brandVoice: 1.5, persuasion: 1 },
  article:      { longform: 3, structure: 2.5, brandVoice: 1.5 },
  ad:           { persuasion: 3, hook: 2 },
  post:         {},
};

/** Build the weighted skill profile this task needs. */
const buildTaskProfile = ({ platform, contentType, language }) => {
  const profile = {};
  const add = (obj = {}) => {
    for (const [skill, w] of Object.entries(obj)) {
      profile[skill] = (profile[skill] || 0) + w;
    }
  };
  add(PLATFORM_PROFILES[String(platform).toLowerCase()] || PLATFORM_PROFILES.facebook);
  add(CONTENT_TYPE_PROFILES[String(contentType).toLowerCase()] || {});

  // Non-English work makes multilingual fluency a first-class requirement.
  if (language && language.toLowerCase() !== 'english') {
    add({ multilingual: 3 });
  }

  // Guarantee every weighted skill has at least a faint floor so a model that
  // is broadly excellent isn't ignored on unweighted skills.
  for (const s of SKILLS) if (!(s in profile)) profile[s] = 0.25;
  return profile;
};

/** Weighted 0-10 score for a model against a task profile (+ language gate). */
const scoreModel = (model, profile, language) => {
  let total = 0;
  let weightSum = 0;
  for (const [skill, w] of Object.entries(profile)) {
    total += (model.skills[skill] ?? 7) * w;
    weightSum += w;
  }
  let score = weightSum ? total / weightSum : model.quality;

  // Language gate: a model that can't speak the target language is unfit.
  const lang = (language || 'english').toLowerCase();
  if (!model.languages.includes(lang)) score -= 4;

  return Math.round(score * 100) / 100;
};

/** The top N weighted skills for a profile, most important first. */
const topSkills = (profile, n = 3) =>
  Object.entries(profile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([s]) => s);

const rationaleFor = (model, profile) => {
  const wins = topSkills(profile, 3)
    .filter((s) => (model.skills[s] ?? 0) >= 8.4)
    .map((s) => SKILL_LABELS[s]);
  if (!wins.length) return `${model.label} is the strongest balanced fit for this task.`;
  const list = wins.length === 1 ? wins[0] : `${wins.slice(0, -1).join(', ')} and ${wins.slice(-1)}`;
  return `${model.label} leads on ${list} — exactly what this task rewards.`;
};

/** Rank all models for a task, best first. */
const rankModels = (task) => {
  const profile = buildTaskProfile(task);
  const ranked = MODELS
    .map((m) => ({ model: m, score: scoreModel(m, profile, task.language) }))
    .sort((a, b) => b.score - a.score || b.model.quality - a.model.quality);
  return { profile, ranked };
};

/**
 * Choose the best single model.
 * Returns { mode, profile, primary, score, rationale, alternatives }.
 */
const selectSingle = (task) => {
  const { profile, ranked } = rankModels(task);
  const winner = ranked[0];
  return {
    mode: 'single',
    profile,
    topSkills: topSkills(profile, 3).map((s) => SKILL_LABELS[s]),
    primary: winner.model,
    score: winner.score,
    rationale: rationaleFor(winner.model, profile),
    alternatives: ranked.slice(1, 4).map((r) => ({
      id: r.model.id, label: r.model.label, provider: r.model.provider, score: r.score,
    })),
  };
};

/**
 * Choose a complementary PAIR for hybrid fusion.
 *
 * Primary = best single model. Partner = the model that adds the most NEW
 * strength on the task's important skills where the primary is comparatively
 * weaker (complementarity gain = Σ weight · max(0, partner.skill − primary.skill)).
 * A different provider is preferred to maximise genuine diversity of "thinking".
 * The synthesiser (which merges the two drafts) is whichever of the pair has the
 * higher brand-voice + structure, so the fused result stays on-brand and clean.
 */
const selectHybrid = (task) => {
  const { profile, ranked } = rankModels(task);
  const primary = ranked[0].model;

  let best = null;
  for (const { model: cand, score } of ranked.slice(1)) {
    let gain = 0;
    const covers = [];
    for (const [skill, w] of Object.entries(profile)) {
      const delta = (cand.skills[skill] ?? 7) - (primary.skills[skill] ?? 7);
      if (delta > 0) {
        gain += w * delta;
        if (w >= 1.5 && delta >= 0.4) covers.push(SKILL_LABELS[skill]);
      }
    }
    // Reward provider diversity — two different "minds" beat two similar ones.
    const diversityBonus = cand.provider !== primary.provider ? 1.15 : 1;
    const complementarity = Math.round(gain * diversityBonus * 100) / 100;
    if (!best || complementarity > best.complementarity) {
      best = { model: cand, score, complementarity, covers: [...new Set(covers)].slice(0, 3) };
    }
  }

  // Synthesiser: the pair member with the better brand-voice + structure blend.
  const brandStructure = (m) => (m.skills.brandVoice ?? 7) + (m.skills.structure ?? 7);
  const synthesizer =
    brandStructure(primary) >= brandStructure(best.model) ? primary : best.model;

  const coversText = best.covers.length
    ? `adds ${best.covers.join(', ')}`
    : 'broadens range and reduces blind spots';

  return {
    mode: 'hybrid',
    profile,
    topSkills: topSkills(profile, 3).map((s) => SKILL_LABELS[s]),
    primary,
    partner: best.model,
    synthesizer,
    complementarity: best.complementarity,
    rationale:
      `Fusing ${primary.label} (lead on ${topSkills(profile, 2).map((s) => SKILL_LABELS[s]).join(' & ')}) ` +
      `with ${best.model.label}, which ${coversText}. ` +
      `${synthesizer.label} merges both drafts into one best-of-both result.`,
    alternatives: ranked.slice(1, 4)
      .filter((r) => r.model.id !== best.model.id)
      .map((r) => ({ id: r.model.id, label: r.model.label, provider: r.model.provider, score: r.score })),
  };
};

/**
 * Top-level entry. `mode`: 'auto' | 'single' | 'hybrid'.
 * In 'auto', the router escalates to hybrid when the task is high-stakes
 * (long-form/blog/ad) or when the top two models are close enough that fusing
 * them is likely to beat either alone.
 */
const route = (task, mode = 'auto') => {
  if (mode === 'single') return selectSingle(task);
  if (mode === 'hybrid') return selectHybrid(task);

  // auto
  const ct = String(task.contentType || '').toLowerCase();
  const highStakes = ['blog', 'article', 'ad', 'story'].includes(ct);
  const { ranked } = rankModels(task);
  const close = ranked.length > 1 && ranked[0].score - ranked[1].score <= 0.25;
  return highStakes || close ? selectHybrid(task) : selectSingle(task);
};

module.exports = { route, selectSingle, selectHybrid, rankModels, buildTaskProfile, SKILL_LABELS };
