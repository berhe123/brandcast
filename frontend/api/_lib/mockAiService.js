/**
 * Mock AI Content Generator (brand-agnostic)
 * -------------------------------------------
 * Produces realistic, platform-appropriate social/blog copy when no real AI key
 * is configured. It is driven entirely by the brand passed in `params.brandInfo`
 * (name, description, website) — there is no hard-coded company. This keeps the
 * demo fully functional and on-brand for whatever brand the user created.
 */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const EMOJI = {
  spark: ['✨', '⭐', '🌟', '💫'],
  rocket: ['🚀', '⚡', '🔥', '💥'],
  check: ['✅', '☑️', '✔️'],
  heart: ['💛', '💚', '💙', '❤️'],
  point: ['👉', '👇', '🙌', '💬'],
};
const e = (k, on) => (on ? pick(EMOJI[k]) : '');

const PLATFORM_LIMITS = { facebook: 500, instagram: 600, twitter: 280, linkedin: 1300, tiktok: 300, blog: 6000 };

const clamp = (text, platform) => {
  const max = PLATFORM_LIMITS[platform] || 600;
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const br = Math.max(cut.lastIndexOf('\n'), cut.lastIndexOf(' '));
  return (br > max * 0.6 ? cut.slice(0, br) : cut).trimEnd() + '…';
};

const stripEmoji = (s) =>
  s.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{2190}-\u{21FF}]|[\u{2B00}-\u{2BFF}]/gu, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

// ─── Hashtags (derived from the brand + topic) ───────────────────────────────
const GENERIC_TAGS = ['#Marketing', '#SocialMedia', '#ContentCreation', '#Branding', '#GrowthTips', '#SmallBusiness', '#DigitalMarketing'];
const STOP = new Set(['the', 'and', 'for', 'with', 'your', 'our', 'you', 'are', 'from', 'this', 'that', 'into', 'why', 'how', 'new', 'now', 'get']);

const makeHashtags = (brand, topic, platform) => {
  const brandTag = '#' + (brand || 'Brand').replace(/[^a-z0-9]/gi, '');
  const topicTags = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w))
    .slice(0, 3)
    .map((w) => '#' + w.charAt(0).toUpperCase() + w.slice(1));

  const pool = [...new Set([brandTag, ...topicTags, ...GENERIC_TAGS])];
  const counts = { instagram: 9, tiktok: 4, linkedin: 3, facebook: 3, twitter: 2 };
  const n = counts[platform] || 3;
  return pool.slice(0, n).join(' ');
};

// ─── Tone-flavoured building blocks ──────────────────────────────────────────
const toneBlocks = (tone, { topic, brand, site, on }) => {
  const cta = site ? `Learn more at ${site}` : `Follow ${brand} for more`;
  const banks = {
    professional: {
      open: [`${topic}.`, `Introducing: ${topic}.`, `At ${brand}, here's what matters: ${topic}.`],
      mid: [`${brand} is committed to delivering real value — quality you can rely on, every time.`,
            `We built ${brand} around what our customers actually need: substance over hype.`],
      cta: [cta, `Discover ${brand} today.`, `${cta}.`],
    },
    friendly: {
      open: [`${e('spark', on)} Big news! ${topic}`, `Hey there — ${topic} ${e('spark', on)}`, `We've got something for you: ${topic}`],
      mid: [`At ${brand}, we love making things simple and genuinely useful for you.`,
            `${brand} is all about you — and we can't wait to share this.`],
      cta: [`${cta} ${e('rocket', on)}`, `Come say hi — ${cta}.`],
    },
    inspiring: {
      open: [`${e('spark', on)} ${topic} — and it's only the beginning.`, `Imagine more. ${topic}.`],
      mid: [`Every step forward with ${brand} is a step toward something better.`,
            `${brand} believes great things happen when you dare to start.`],
      cta: [`Be part of it — ${cta}.`, `${cta} ${e('heart', on)}`],
    },
    exciting: {
      open: [`${e('rocket', on)} HUGE: ${topic}`, `You won't want to miss this — ${topic} ${e('rocket', on)}`],
      mid: [`${brand} is turning heads, and this is exactly why.`,
            `This is the moment. ${brand} is making it happen.`],
      cta: [`Don't wait — ${cta}! ${e('rocket', on)}`, `${cta} now!`],
    },
    educational: {
      open: [`Did you know? ${topic}`, `Quick guide: ${topic}`, `Here's what to know about ${topic}.`],
      mid: [`${brand} breaks it down so it actually makes sense — no jargon, just clarity.`,
            `Understanding this is easier than you think, and ${brand} is here to help.`],
      cta: [`${cta} to learn more.`, cta],
    },
    witty: {
      open: [`Plot twist: ${topic} ${e('spark', on)}`, `Let's be honest — ${topic}.`],
      mid: [`${brand}: doing the work so you don't have to overthink it.`,
            `Turns out smart choices look a lot like ${brand}.`],
      cta: [`Your move — ${cta} ${e('point', on)}`, `${cta}. You're welcome.`],
    },
    urgent: {
      open: [`${e('rocket', on)} Limited time: ${topic}`, `Act fast — ${topic}!`],
      mid: [`Opportunities like this from ${brand} don't last long.`,
            `${brand} is moving fast — make sure you don't miss out.`],
      cta: [`${cta} before it's gone ${e('rocket', on)}`, `Hurry — ${cta}.`],
    },
    warm: {
      open: [`${e('heart', on)} ${topic}`, `There's something special here: ${topic}.`],
      mid: [`${brand} is built on care — for our craft and for you.`,
            `We're grateful you're here. ${brand} is glad to share this with you.`],
      cta: [`${cta} ${e('heart', on)}`, `We'd love to see you — ${cta}.`],
    },
  };
  return banks[tone] || banks.friendly;
};

// ─── Long-form blog / article ────────────────────────────────────────────────
const buildBlog = ({ topic, brand, site, language, on }) => {
  const title = topic.replace(/\b\w/g, (c) => c.toUpperCase());
  const link = site || `${brand}'s website`;
  if (language === 'german') {
    return `# ${title}\n\n` +
`${topic} ist mehr als ein Trend — für ${brand} ist es eine bewusste Entscheidung, die echten Mehrwert schafft.\n\n` +
`## Warum das wichtig ist\n\nBei ${brand} steht Qualität an erster Stelle. Wir glauben, dass durchdachte Lösungen den Unterschied machen.\n\n` +
`## Was ${brand} besonders macht\n\nWir hören zu, wir liefern, und wir bleiben unserem Versprechen treu — bei allem, was wir tun.\n\n` +
`## Fazit\n\n${title} ist einfach und lohnend. Erfahren Sie mehr unter ${link}.`;
  }
  return `# ${title}\n\n` +
`${topic} isn't just a trend — for ${brand}, it's a deliberate choice that creates real value for the people who matter most. ${on ? e('spark', on) : ''}\n\n` +
`## Why it matters\n\nAt ${brand}, quality comes first. We believe thoughtful, well-made solutions are what truly set a brand apart — and that's the standard we hold ourselves to.\n\n` +
`## What makes ${brand} different\n\nWe listen, we deliver, and we stay true to our promise in everything we do. It's a simple philosophy, but it shapes every decision.\n\n` +
`## Bringing it together\n\n- Built around what you actually need\n- Honest, dependable quality\n- A team that genuinely cares\n\n` +
`## The bottom line\n\n${title} is simple, valuable, and worth your attention. Learn more at ${link}.`;
};

// ─── German short-form ───────────────────────────────────────────────────────
const buildGerman = ({ platform, topic, brand, site, on }) => {
  const cta = site ? `Mehr erfahren: ${site}` : `Folge ${brand} für mehr`;
  const body = `${e('spark', on)} ${topic}\n\nBei ${brand} setzen wir auf Qualität und echten Mehrwert. ${cta}.`;
  return body.trim();
};

// ─── Main generator ──────────────────────────────────────────────────────────
const generateMockContent = (params) => {
  const {
    platform, topic, tone, contentType, language,
    includeHashtags, includeEmoji, brandInfo,
  } = params;
  const on = includeEmoji !== false;
  const brand = brandInfo?.name && brandInfo.name !== 'the brand' ? brandInfo.name : 'our brand';
  const site = brandInfo?.website || '';

  // Long-form
  if (platform === 'blog' || contentType === 'blog' || contentType === 'article') {
    let out = buildBlog({ topic, brand, site, language, on });
    return on ? out : stripEmoji(out);
  }

  // German short-form
  if (language === 'german') {
    let out = buildGerman({ platform, topic, brand, site, on });
    if (includeHashtags !== false && platform !== 'twitter') out += `\n\n${makeHashtags(brand, topic, platform)}`;
    return clamp(on ? out : stripEmoji(out), platform);
  }

  const t = toneBlocks(tone, { topic, brand, site, on });
  let body;

  if (platform === 'twitter') {
    body = `${pick(t.open)}\n\n${pick(t.cta)}`;
  } else if (platform === 'tiktok') {
    body = `${e('rocket', on)} ${topic}\n\n${pick(t.mid)}\n\n${pick(t.cta)}`;
  } else if (platform === 'instagram') {
    body = `${pick(t.open)}\n\n${pick(t.mid)}\n\n${pick(t.cta)}`;
  } else if (platform === 'linkedin') {
    body = `${pick(t.open)}\n\n${pick(t.mid)}\n\n${pick(t.cta)}`;
  } else {
    // facebook & default
    body = `${pick(t.open)}\n\n${pick(t.mid)}\n\n${pick(t.cta)}`;
  }

  if (includeHashtags !== false) {
    if (platform === 'twitter') body += ` ${makeHashtags(brand, topic, 'twitter')}`;
    else body += `\n\n${makeHashtags(brand, topic, platform)}`;
  }

  return clamp(on ? body : stripEmoji(body), platform);
};

module.exports = { generateMockContent };
