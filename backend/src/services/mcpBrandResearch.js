/**
 * Marketing Context Protocol — brand website research
 * ----------------------------------------------------
 * Studies company websites to build marketing/brand context
 * for AI content generation (works alongside Model Context Protocol tools).
 */

const fetchText = async (url, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'BrandcastMCP/1.0 (+https://brandcast.app; brand-research)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
};

const stripTags = (html = '') =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const metaContent = (html, name) => {
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return '';
};

const firstMatch = (html, re) => {
  const m = html.match(re);
  return m?.[1]?.trim() || '';
};

const extractHeadings = (html) => {
  const out = [];
  const re = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  let m;
  while ((m = re.exec(html)) && out.length < 12) {
    const t = stripTags(m[1]);
    if (t && t.length > 2 && t.length < 120) out.push(t);
  }
  return [...new Set(out)];
};

const guessIndustry = (blob) => {
  const text = blob.toLowerCase();
  const rules = [
    [/coffee|cafe|espresso|latte|bakery/, 'coffee / hospitality'],
    [/fashion|apparel|clothing|wear|sneaker/, 'fashion / retail'],
    [/saas|software|api|platform|cloud/, 'software / SaaS'],
    [/fitness|gym|workout|yoga/, 'fitness / wellness'],
    [/real.?estate|property|homes?/, 'real estate'],
    [/food|restaurant|kitchen|menu/, 'food / restaurant'],
    [/beauty|skincare|cosmetic/, 'beauty'],
    [/education|course|learn|school/, 'education'],
    [/agency|marketing|branding|seo/, 'marketing agency'],
    [/finance|bank|invest|fintech/, 'finance'],
  ];
  for (const [re, label] of rules) {
    if (re.test(text)) return label;
  }
  return 'general business';
};

const guessAudience = (blob) => {
  const text = blob.toLowerCase();
  if (/student|campus|gen.?z/.test(text)) return 'students & young adults';
  if (/enterprise|b2b|companies|teams/.test(text)) return 'business professionals';
  if (/parent|family|kids/.test(text)) return 'parents & families';
  if (/eco|sustainab|green/.test(text)) return 'eco-conscious consumers';
  return 'general customers';
};

const guessVoice = (blob) => {
  const text = blob.toLowerCase();
  if (/premium|luxury|exclusive/.test(text)) return 'premium, polished, confident';
  if (/fun|playful|bold|vibe/.test(text)) return 'playful, energetic, approachable';
  if (/trust|secure|expert|professional/.test(text)) return 'professional, trustworthy, clear';
  if (/community|together|local/.test(text)) return 'warm, community-first, friendly';
  return 'clear, engaging, on-brand';
};

const relatedPaths = ['/', '/about', '/about-us', '/company', '/services', '/products', '/our-story'];

/**
 * Research a brand from its website URL.
 * @returns {Promise<object>} MCP brand profile
 */
async function researchBrandFromWebsite(websiteUrl, hints = {}) {
  const started = Date.now();
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`);
  } catch {
    throw Object.assign(new Error('Invalid website URL'), { status: 400 });
  }

  const pages = [];
  const errors = [];
  const origins = relatedPaths.map((p) => new URL(p, url.origin).toString());
  // Prefer the exact URL first, then common related pages.
  const targets = [url.toString(), ...origins.filter((u) => u !== url.toString())].slice(0, 5);

  for (const target of targets) {
    try {
      const html = await fetchText(target);
      pages.push({ url: target, html });
    } catch (err) {
      errors.push({ url: target, error: err.message });
    }
  }

  if (!pages.length) {
    // Offline / unreachable — still return a useful MCP profile from hints.
    const name = hints.name || url.hostname.replace(/^www\./, '');
    return {
      protocol: 'Marketing Context Protocol',
      version: '1.0',
      source: 'fallback',
      researchedAt: new Date().toISOString(),
      website: url.origin,
      name,
      tagline: hints.description?.slice(0, 80) || `${name} — built for customers who care`,
      description: hints.description || `${name} helps customers through its products and services.`,
      industry: guessIndustry(`${name} ${hints.description || ''}`),
      audience: guessAudience(hints.description || ''),
      voice: guessVoice(hints.description || ''),
      values: ['quality', 'trust', 'customer'],
      offerings: [],
      keywords: [],
      headings: [],
      summary: `Brand profile inferred for ${name} (website unreachable during research).`,
      confidence: 0.35,
      pagesScanned: 0,
      durationMs: Date.now() - started,
      errors,
    };
  }

  const primary = pages[0].html;
  const title = firstMatch(primary, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const ogTitle = metaContent(primary, 'og:title');
  const description =
    metaContent(primary, 'description') ||
    metaContent(primary, 'og:description') ||
    hints.description ||
    '';
  const ogSite = metaContent(primary, 'og:site_name');
  const headings = pages.flatMap((p) => extractHeadings(p.html)).slice(0, 16);
  const bodyText = pages.map((p) => stripTags(p.html).slice(0, 4000)).join(' ');
  const blob = `${title} ${ogTitle} ${description} ${headings.join(' ')} ${bodyText} ${hints.description || ''}`;

  const titleBit = (ogTitle || title || '').split(/[|]/)[0] || '';
  const name =
    hints.name ||
    ogSite ||
    titleBit.trim() ||
    url.hostname.replace(/^www\./, '');

  const offerings = headings
    .filter((h) => /service|product|offer|menu|solution|plan|feature/i.test(h))
    .slice(0, 8);

  const keywords = [...new Set(
    blob
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 80)
  )].slice(0, 18);

  const industry = guessIndustry(blob);
  const audience = guessAudience(blob);
  const voice = guessVoice(blob);
  const values = [];
  if (/sustain|eco|green/.test(blob.toLowerCase())) values.push('sustainability');
  if (/quality|premium|craft/.test(blob.toLowerCase())) values.push('craftsmanship');
  if (/community|local|together/.test(blob.toLowerCase())) values.push('community');
  if (/innov|future|tech/.test(blob.toLowerCase())) values.push('innovation');
  if (!values.length) values.push('customer focus', 'quality');

  const tagline =
    description.slice(0, 110) ||
    headings[0] ||
    `${name} — ${industry}`;

  return {
    protocol: 'Marketing Context Protocol',
    version: '1.0',
    source: 'website',
    researchedAt: new Date().toISOString(),
    website: url.origin,
    name,
    tagline,
    description: description || `${name} operates in ${industry}, serving ${audience}.`,
    industry,
    audience,
    voice,
    values,
    offerings,
    keywords,
    headings: headings.slice(0, 10),
    summary: `${name} is a ${industry} brand. Voice: ${voice}. Audience: ${audience}. Focus: ${(offerings[0] || headings[0] || 'customer value')}.`,
    confidence: Math.min(0.95, 0.45 + pages.length * 0.12),
    pagesScanned: pages.length,
    durationMs: Date.now() - started,
    errors,
  };
}

/** Flatten MCP profile into brandInfo fields the AI prompt already understands. */
function mcpToBrandInfo(mcp, brand = {}) {
  if (!mcp) {
    return {
      name: brand.name || 'the brand',
      description: brand.description || '',
      website: brand.website || '',
      voice: '',
      tagline: '',
      values: [],
      mcp: null,
    };
  }
  return {
    name: brand.name || mcp.name,
    description: [brand.description, mcp.description, mcp.summary].filter(Boolean).join(' · '),
    website: brand.website || mcp.website,
    voice: mcp.voice,
    tagline: mcp.tagline,
    values: mcp.values || [],
    industry: mcp.industry,
    audience: mcp.audience,
    offerings: mcp.offerings || [],
    keywords: mcp.keywords || [],
    mcp,
  };
}

module.exports = {
  researchBrandFromWebsite,
  mcpToBrandInfo,
};
