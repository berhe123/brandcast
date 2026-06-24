/**
 * Publish scheduler.
 * A lightweight background loop that "publishes" due scheduled posts. Real
 * publishing (Meta Graph API, X API, LinkedIn API, …) would slot into
 * `dispatchToPlatform()`. For the demo it simulates a successful publish and
 * generates plausible engagement metrics that power the analytics dashboard.
 */

const { scheduled, events } = require('../db/store');

const TICK_MS = 15 * 1000;
let timer = null;

// Plausible per-platform engagement so analytics looks alive in the demo.
const mockMetrics = (platform) => {
  const base = {
    facebook: { reach: [800, 4000], rate: 0.04 },
    instagram: { reach: [1200, 6000], rate: 0.06 },
    twitter: { reach: [500, 3000], rate: 0.03 },
    linkedin: { reach: [600, 2500], rate: 0.05 },
    tiktok: { reach: [2000, 20000], rate: 0.09 },
    blog: { reach: [300, 1500], rate: 0.02 },
  }[platform] || { reach: [500, 3000], rate: 0.04 };

  const rand = (min, max) => Math.floor(min + Math.random() * (max - min));
  const impressions = rand(base.reach[0], base.reach[1]);
  const engaged = Math.floor(impressions * base.rate * (0.6 + Math.random() * 0.8));
  const likes = Math.floor(engaged * (0.6 + Math.random() * 0.2));
  const comments = Math.floor(engaged * (0.1 + Math.random() * 0.1));
  const shares = Math.max(0, engaged - likes - comments);
  return { impressions, likes, comments, shares, clicks: Math.floor(engaged * 0.3) };
};

/** Simulate sending a post to its platform. Replace with real API calls. */
const dispatchToPlatform = async (post) => ({ ok: true, externalId: `mock_${post.platform}_${Date.now()}` });

/** Publish a single post now (also used for "publish immediately"). */
const publishPost = (id) => {
  const post = scheduled.find((s) => s.id === id);
  if (!post || post.status === 'published') return post;
  const metrics = mockMetrics(post.platform);
  const updated = scheduled.update(id, {
    status: 'published',
    publishedAt: new Date().toISOString(),
    metrics,
  });
  events.insert({
    type: 'publish',
    userId: post.userId,
    platform: post.platform,
    postId: post.id,
    metrics,
  });
  return updated;
};

const tick = () => {
  const now = Date.now();
  scheduled
    .filter((s) => (s.status === 'scheduled' || s.status === 'publishing') && new Date(s.scheduledFor).getTime() <= now)
    .forEach((s) => publishPost(s.id));
};

const start = () => {
  if (timer) return;
  timer = setInterval(tick, TICK_MS);
  if (timer.unref) timer.unref(); // don't keep the process alive just for this
  tick(); // run once on boot to catch anything already due
};

module.exports = { start, publishPost, mockMetrics };
