/**
 * Monthly content plan generator
 * ------------------------------
 * Turns a goal prompt + MCP brand context into 8–15 scheduled posts
 * with varied platforms, angles, and week placement.
 */

const { generateSocialContent } = require('./aiService');
const { mcpToBrandInfo } = require('./mcpBrandResearch');

const PLATFORM_CYCLE = ['instagram', 'facebook', 'tiktok', 'linkedin', 'twitter', 'instagram', 'facebook', 'blog'];

const ANGLE_POOL = [
  { type: 'awareness', label: 'Brand story', hook: 'Introduce who you are and why customers should care' },
  { type: 'engagement', label: 'Conversation starter', hook: 'Ask a question that invites comments' },
  { type: 'educational', label: 'Helpful tip', hook: 'Teach one practical tip related to the offer' },
  { type: 'social_proof', label: 'Proof / love', hook: 'Highlight a customer win or testimonial angle' },
  { type: 'promotion', label: 'Offer spotlight', hook: 'Soft-sell a product, menu item, or service' },
  { type: 'behind_scenes', label: 'Behind the scenes', hook: 'Show the craft, team, or process' },
  { type: 'ugc_prompt', label: 'Community invite', hook: 'Invite followers to share their experience' },
  { type: 'seasonal', label: 'Timely moment', hook: 'Tie into the month, season, or local vibe' },
  { type: 'myth_bust', label: 'Myth vs fact', hook: 'Clear up a common misconception in your niche' },
  { type: 'howto', label: 'How-to mini', hook: 'Walk through a simple how-to in 3 steps' },
  { type: 'listicle', label: 'Quick list', hook: 'Share 3 reasons / tips in a scannable list' },
  { type: 'cta', label: 'Visit / book CTA', hook: 'Drive a clear next step: visit, DM, book, order' },
  { type: 'value', label: 'Value reminder', hook: 'Remind people of the core benefit you deliver' },
  { type: 'local', label: 'Local love', hook: 'Celebrate neighborhood / community connection' },
  { type: 'reels_script', label: 'Short-form idea', hook: 'Write a punchy caption suited to short video' },
];

const TONE_CYCLE = ['friendly', 'inspiring', 'warm', 'exciting', 'educational', 'witty', 'professional'];

/**
 * Decide how many posts (8–15) based on the intensity of the goal.
 */
function decidePostCount(goal) {
  const g = String(goal || '').toLowerCase();
  let n = 10;
  if (/aggress|heavy|daily|grow fast|more customers|scale|launch/.test(g)) n = 14;
  else if (/soft|light|gentle|maintain|slow/.test(g)) n = 8;
  else if (/week|campaign|promo|sale/.test(g)) n = 12;
  else if (/month|monthly|calendar/.test(g)) n = 12;
  // Length signal
  if (g.length > 160) n = Math.min(15, n + 1);
  if (g.length < 40) n = Math.max(8, n - 1);
  return Math.max(8, Math.min(15, n));
}

function weekForIndex(i, total) {
  const week = Math.min(4, Math.floor((i / total) * 4) + 1);
  return week;
}

function dayLabel(week, slotInWeek) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days[slotInWeek % days.length];
}

function buildSkeleton(goal, brandInfo, count) {
  const industry = brandInfo.industry || brandInfo.mcp?.industry || 'business';
  const name = brandInfo.name || 'the brand';
  const items = [];
  const weekBuckets = { 1: 0, 2: 0, 3: 0, 4: 0 };

  for (let i = 0; i < count; i++) {
    const angle = ANGLE_POOL[i % ANGLE_POOL.length];
    const platform = PLATFORM_CYCLE[i % PLATFORM_CYCLE.length];
    const week = weekForIndex(i, count);
    const slot = weekBuckets[week]++;
    const tone = TONE_CYCLE[i % TONE_CYCLE.length];
    const topic = `${angle.hook} for ${name} (${industry}). Goal: ${goal}. Angle: ${angle.label}.`;

    items.push({
      id: `m-${i + 1}`,
      index: i + 1,
      week,
      day: dayLabel(week, slot),
      platform,
      contentType: angle.type === 'promotion' ? 'promotion' : angle.type === 'engagement' ? 'engagement' : 'post',
      tone,
      angle: angle.type,
      angleLabel: angle.label,
      topic,
      status: 'pending',
    });
  }
  return items;
}

/**
 * Generate a full monthly plan (content filled).
 * Uses sequential generation to avoid rate spikes; demo mode is fast.
 */
async function generateMonthlyPlan({ goal, brandInfo, brand, mcp, language = 'english', includeHashtags = true, includeEmoji = true }) {
  const resolvedBrand = mcpToBrandInfo(mcp || brandInfo?.mcp, {
    ...brand,
    ...brandInfo,
  });

  const count = decidePostCount(goal);
  const skeleton = buildSkeleton(goal, resolvedBrand, count);
  const posts = [];

  for (const item of skeleton) {
    try {
      const result = await generateSocialContent(
        {
          platform: item.platform,
          topic: item.topic,
          tone: item.tone,
          contentType: item.contentType,
          targetAudience: resolvedBrand.audience || 'general',
          language,
          includeHashtags,
          includeEmoji,
          customInstructions: `This is post ${item.index}/${count} in a monthly marketing calendar (week ${item.week}, ${item.day}). Keep it distinct from other posts. Goal context: ${goal}${resolvedBrand.customContext ? `\n${resolvedBrand.customContext}` : ''}`,
          brandInfo: resolvedBrand,
        },
        { mode: 'single' }
      );

      posts.push({
        ...item,
        status: 'ready',
        content: result.content,
        routing: result.routing,
        live: result.live,
      });
    } catch (err) {
      posts.push({
        ...item,
        status: 'error',
        content: '',
        error: err.message || 'Failed to generate',
      });
    }
  }

  const byWeek = { 1: [], 2: [], 3: [], 4: [] };
  for (const p of posts) byWeek[p.week].push(p);

  return {
    goal,
    postCount: posts.length,
    brandName: resolvedBrand.name,
    industry: resolvedBrand.industry || resolvedBrand.mcp?.industry || null,
    mcpUsed: Boolean(resolvedBrand.mcp),
    mcpSummary: resolvedBrand.mcp?.summary || null,
    createdAt: new Date().toISOString(),
    weeks: byWeek,
    posts,
    mix: {
      platforms: posts.reduce((acc, p) => {
        acc[p.platform] = (acc[p.platform] || 0) + 1;
        return acc;
      }, {}),
      angles: posts.reduce((acc, p) => {
        acc[p.angleLabel] = (acc[p.angleLabel] || 0) + 1;
        return acc;
      }, {}),
    },
  };
}

module.exports = { generateMonthlyPlan, decidePostCount };
