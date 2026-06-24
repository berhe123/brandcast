/**
 * Provider Adapters + Hybrid Fusion
 * ----------------------------------
 * One uniform interface — generate(model, params) → { text, live } — across
 * Anthropic, OpenAI, Gemini and DeepSeek.
 *
 *   • If the provider's API key is present, the REAL path runs (Anthropic via
 *     its SDK; the others via fetch — no extra dependencies).
 *   • Otherwise a provider-FLAVOURED mock runs, so each model produces a
 *     genuinely different draft. That difference is what makes hybrid fusion
 *     visibly valuable in the demo.
 *
 * fuse(synthesizer, draftA, draftB, params) merges two drafts into one
 * best-of-both result — via the synthesiser model when live, or a deterministic
 * "best hook + richest body + best CTA" merge when mocked.
 */

const Anthropic = require('@anthropic-ai/sdk');
const { generateMockContent } = require('../services/mockAiService');
const { isModelLive } = require('./catalog');

const PLATFORM_LIMITS = { facebook: 500, instagram: 600, twitter: 280, linkedin: 1300, tiktok: 300, blog: 6000, article: 6000 };

const limitFor = (platform) => PLATFORM_LIMITS[String(platform).toLowerCase()] || 600;

const clamp = (text, platform) => {
  const max = limitFor(platform);
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const br = Math.max(cut.lastIndexOf('\n'), cut.lastIndexOf(' '));
  return (br > max * 0.6 ? cut.slice(0, br) : cut).trimEnd() + '…';
};

// ─── Prompt builder (used by the real provider calls) ──────────────────────
const buildPrompt = (model, params) => {
  const { platform, topic, tone, contentType, targetAudience, language, includeHashtags, includeEmoji, customInstructions, brandInfo } = params;
  const b = brandInfo || {};
  return `You are an expert social media copywriter for ${b.name || 'the brand'}.
BRAND: ${b.description || ''} | Voice: ${b.voice || ''} | Tagline: "${b.tagline || ''}"
TASK: Write a ${contentType} for ${platform} about "${topic}".
SETTINGS: tone=${tone}; audience=${targetAudience}; language=${language}; hashtags=${includeHashtags ? 'yes' : 'no'}; emojis=${includeEmoji ? 'yes' : 'no'}.
RULES: Output ONLY the ready-to-post content. Respect ${platform}'s norms and length. ${language === 'german' ? 'Write entirely in German.' : 'Write in English.'}${customInstructions ? ` Special: ${customInstructions}` : ''}
Write the post now:`;
};

// ─── Real provider calls (run only when a key is present) ───────────────────
const callAnthropic = async (model, params) => {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: model.id, max_tokens: 1500,
    messages: [{ role: 'user', content: buildPrompt(model, params) }],
  });
  return msg.content[0].text.trim();
};

const callOpenAI = async (model, params) => {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: model.id, max_tokens: 1500, messages: [{ role: 'user', content: buildPrompt(model, params) }] }),
  });
  if (!res.ok) throw Object.assign(new Error(`OpenAI ${res.status}`), { status: res.status });
  const data = await res.json();
  return data.choices[0].message.content.trim();
};

const callGemini = async (model, params) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: buildPrompt(model, params) }] }] }),
  });
  if (!res.ok) throw Object.assign(new Error(`Gemini ${res.status}`), { status: res.status });
  const data = await res.json();
  return data.candidates[0].content.parts[0].text.trim();
};

const callDeepSeek = async (model, params) => {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({ model: model.id, max_tokens: 1500, messages: [{ role: 'user', content: buildPrompt(model, params) }] }),
  });
  if (!res.ok) throw Object.assign(new Error(`DeepSeek ${res.status}`), { status: res.status });
  const data = await res.json();
  return data.choices[0].message.content.trim();
};

const REAL_CALLS = { anthropic: callAnthropic, openai: callOpenAI, gemini: callGemini, deepseek: callDeepSeek };

// ─── Provider-flavoured mocks (make each draft genuinely distinct) ──────────
const brandName = (p) => (p?.brandInfo?.name && p.brandInfo.name !== 'the brand' ? p.brandInfo.name : 'our brand');

const FLAVOURS = {
  // GPT-4o: punchy, trend-forward — leads with a bold scroll-stopping hook.
  openai: (base, { topic }) => {
    const hooks = ['🔥 Stop scrolling.', '👀 Real talk:', '⚡ Big news:', "🚀 Here's the deal —"];
    const hook = hooks[topic.length % hooks.length];
    return `${hook} ${base}`;
  },
  // Claude: warm, on-brand storytelling — adds a human, values-led closing beat.
  anthropic: (base, p) => `${base}\n\nMade with care by ${brandName(p)}. 💛`,
  // Gemini: structured & multilingual — surfaces a crisp, scannable angle line.
  gemini: (base, { topic }) => `${base}\n\nWhy it matters: ${topic} — done right.`,
  // DeepSeek: persuasive & logical — closes with a sharp reason-to-act CTA.
  deepseek: (base, p) => `${base}\n\n${brandName(p)}: the smart choice. Get started today →`,
};

const generateMock = async (model, params) => {
  // Vary the base slightly per provider so drafts differ in body, not just trim.
  const base = generateMockContent(params);
  const flavour = FLAVOURS[model.provider] || ((b) => b);
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 500));
  return clamp(flavour(base, params), params.platform);
};

/** Uniform generate. Falls back to mock on auth/availability errors. */
const generate = async (model, params) => {
  if (!isModelLive(model)) {
    return { text: await generateMock(model, params), live: false };
  }
  try {
    const text = clamp(await REAL_CALLS[model.provider](model, params), params.platform);
    return { text, live: true };
  } catch (err) {
    if (err.status === 429) throw Object.assign(new Error('Rate limit reached. Please wait and retry.'), { status: 429 });
    // Any auth/availability problem → graceful mock so the demo never breaks.
    console.warn(`[adapter:${model.provider}] real call failed, using mock:`, err.message);
    return { text: await generateMock(model, params), live: false };
  }
};

// ─── Hybrid fusion ──────────────────────────────────────────────────────────
const firstLine = (t) => t.split('\n').find((l) => l.trim().length) || t;
const splitHashtags = (t) => {
  const m = t.match(/\n*([^\n]*#\w[\s\S]*)$/);
  return m ? { body: t.slice(0, m.index).trimEnd(), tags: m[1].trim() } : { body: t.trim(), tags: '' };
};

// Normalised line signature: lowercase alphanumerics only, so two lines that
// differ just by emoji/flavour prefixes (e.g. "👀 Real talk: X" vs "X") collapse.
const sig = (line) => line.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const fuseMock = (draftA, draftB, params) => {
  // Best-of-both: strongest hook from A, richest body from B, tags from either.
  const hook = firstLine(draftA).trim();
  const { body: bodyB, tags: tagsB } = splitHashtags(draftB);
  const { tags: tagsA } = splitHashtags(draftA);

  // Drop any draft-B line that restates the hook (exact or near-duplicate), so
  // the fused post never repeats the opening beat.
  const seen = new Set([sig(hook)]);
  const bodyLines = bodyB.split('\n').filter((l) => {
    const s = sig(l);
    if (!s) return true; // keep blank lines for spacing
    if (seen.has(s)) return false;
    // near-duplicate of the hook (one contains the other)
    const h = sig(hook);
    if (h && (s.includes(h) || h.includes(s)) && Math.min(s.length, h.length) > 12) return false;
    seen.add(s);
    return true;
  });

  const tags = tagsB || tagsA;
  let merged = [hook, '', bodyLines.join('\n').replace(/\n{3,}/g, '\n\n').trim()].join('\n').trim();
  if (tags) merged += `\n\n${tags}`;
  return clamp(merged, params.platform);
};

const fuseReal = async (synth, draftA, draftB, params) => {
  const prompt = `You are a senior editor. Below are two AI-written drafts of the same ${params.platform} ${params.contentType} about "${params.topic}".
Merge them into ONE superior post: keep the strongest hook, the most persuasive body, and the best call-to-action. Remove redundancy. Match ${params.language === 'german' ? 'German' : 'English'} and ${params.platform}'s norms. Output ONLY the final post.

DRAFT A (${'creative/hook lead'}):
${draftA}

DRAFT B (complementary strengths):
${draftB}

Final merged post:`;
  const text = await REAL_CALLS[synth.provider](synth, { ...params, _rawPrompt: prompt });
  return clamp(text, params.platform);
};

/** Merge two drafts into a best-of-both result. */
const fuse = async (synthesizer, draftA, draftB, params) => {
  if (isModelLive(synthesizer)) {
    try {
      return { text: await fuseReal(synthesizer, draftA, draftB, params), live: true };
    } catch (err) {
      console.warn(`[fuse:${synthesizer.provider}] real fuse failed, using mock:`, err.message);
    }
  }
  await new Promise((r) => setTimeout(r, 350));
  return { text: fuseMock(draftA, draftB, params), live: false };
};

module.exports = { generate, fuse, buildPrompt };
