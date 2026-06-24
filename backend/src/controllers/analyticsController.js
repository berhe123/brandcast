/**
 * Analytics controller.
 * Aggregates generations (content) and published posts (scheduled + metrics) into
 * the numbers the dashboard shows: volume by platform, AI-model usage (incl. the
 * hybrid-fusion share — your differentiator), engagement totals, and which model
 * drives the best engagement per platform.
 *
 * Scope is per-user by default; admins may pass ?scope=all for org-wide numbers.
 */

const { content, scheduled } = require('../db/store');

const PLATFORMS = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'blog'];
const sum = (arr) => arr.reduce((a, b) => a + b, 0);

const getAnalytics = (req, res) => {
  const orgWide = req.query.scope === 'all' && req.user.role === 'admin';
  const mine = (item) => orgWide || item.userId === req.user.id;

  const gens = content.filter(mine);
  const posts = scheduled.filter(mine);
  const published = posts.filter((p) => p.status === 'published' && p.metrics);

  // ── Volume by platform ─────────────────────────────────────────────────
  const byPlatform = {};
  PLATFORMS.forEach((p) => { byPlatform[p] = { generated: 0, published: 0, impressions: 0, engagement: 0 }; });
  gens.forEach((g) => { if (byPlatform[g.platform]) byPlatform[g.platform].generated += 1; });
  published.forEach((p) => {
    const b = byPlatform[p.platform];
    if (!b) return;
    b.published += 1;
    b.impressions += p.metrics.impressions || 0;
    b.engagement += (p.metrics.likes || 0) + (p.metrics.comments || 0) + (p.metrics.shares || 0);
  });

  // ── AI model usage + hybrid share ──────────────────────────────────────
  const modelUsage = {};
  let hybridCount = 0;
  const bump = (label) => { if (label) modelUsage[label] = (modelUsage[label] || 0) + 1; };
  gens.forEach((g) => {
    const r = g.routing;
    if (!r) return;
    if (r.mode === 'hybrid') {
      hybridCount += 1;
      bump(r.primary?.label);
      bump(r.partner?.label);
    } else {
      bump(r.primary?.label);
    }
  });

  // ── Engagement totals ──────────────────────────────────────────────────
  const totals = {
    impressions: sum(published.map((p) => p.metrics.impressions || 0)),
    likes: sum(published.map((p) => p.metrics.likes || 0)),
    comments: sum(published.map((p) => p.metrics.comments || 0)),
    shares: sum(published.map((p) => p.metrics.shares || 0)),
    clicks: sum(published.map((p) => p.metrics.clicks || 0)),
  };
  const engagementTotal = totals.likes + totals.comments + totals.shares;
  const engagementRate = totals.impressions ? +(engagementTotal / totals.impressions * 100).toFixed(2) : 0;

  // ── Best model per platform (by avg engagement rate of its posts) ───────
  const perfMap = {}; // platform -> model -> { eng, imp, n }
  published.forEach((p) => {
    const model = p.routing?.mode === 'hybrid'
      ? `Hybrid: ${p.routing.primary?.label} + ${p.routing.partner?.label}`
      : (p.routing?.primary?.label || 'Unknown');
    perfMap[p.platform] = perfMap[p.platform] || {};
    const e = perfMap[p.platform][model] || { eng: 0, imp: 0, n: 0 };
    e.eng += (p.metrics.likes || 0) + (p.metrics.comments || 0) + (p.metrics.shares || 0);
    e.imp += p.metrics.impressions || 0;
    e.n += 1;
    perfMap[p.platform][model] = e;
  });
  const bestModelByPlatform = Object.entries(perfMap).map(([platform, models]) => {
    const ranked = Object.entries(models)
      .map(([model, e]) => ({ model, rate: e.imp ? +(e.eng / e.imp * 100).toFixed(2) : 0, posts: e.n }))
      .sort((a, b) => b.rate - a.rate);
    return { platform, best: ranked[0], all: ranked };
  });

  // ── 14-day generation timeline ─────────────────────────────────────────
  const days = 14;
  const timeline = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().slice(0, 10);
    const count = gens.filter((g) => (g.createdAt || '').slice(0, 10) === key).length;
    return { date: key, count };
  });

  res.json({
    success: true,
    data: {
      scope: orgWide ? 'org' : 'me',
      summary: {
        generated: gens.length,
        scheduled: posts.filter((p) => p.status === 'scheduled').length,
        published: published.length,
        hybridCount,
        hybridShare: gens.length ? +(hybridCount / gens.length * 100).toFixed(1) : 0,
        engagementRate,
      },
      totals,
      byPlatform,
      modelUsage,
      bestModelByPlatform,
      timeline,
    },
  });
};

module.exports = { getAnalytics };
