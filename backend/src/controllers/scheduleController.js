/**
 * Scheduling controller.
 * Users queue platform-specific posts for a future time. A background scheduler
 * (services/scheduler.js) flips due posts to "published" and attaches (mock)
 * engagement metrics, which feed the analytics dashboard.
 */

const { scheduled } = require('../db/store');
const { publishPost } = require('../services/scheduler');

const PLATFORMS = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'blog'];

// POST /api/schedule
const createScheduled = (req, res) => {
  const { platform, content, scheduledFor, topic, brandName, routing } = req.body;
  if (!platform || !PLATFORMS.includes(String(platform).toLowerCase())) {
    return res.status(400).json({ success: false, error: 'A valid platform is required.' });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'Content is required.' });
  }
  const when = scheduledFor ? new Date(scheduledFor) : null;
  if (!when || isNaN(when.getTime())) {
    return res.status(400).json({ success: false, error: 'A valid scheduled time is required.' });
  }

  const post = scheduled.insert({
    userId: req.user.id,
    platform: String(platform).toLowerCase(),
    topic: topic || '',
    brandName: brandName || '',
    content: content.trim(),
    routing: routing || null,
    status: when.getTime() <= Date.now() ? 'publishing' : 'scheduled',
    scheduledFor: when.toISOString(),
    metrics: null,
    publishedAt: null,
  });

  // If it's due immediately, publish right away (mock).
  if (post.status === 'publishing') publishPost(post.id);

  res.status(201).json({ success: true, data: scheduled.find((s) => s.id === post.id) });
};

// GET /api/schedule?status=
const listScheduled = (req, res) => {
  const { status } = req.query;
  let items = scheduled.filter((s) => s.userId === req.user.id);
  if (status && status !== 'all') items = items.filter((s) => s.status === status);
  items.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
  res.json({ success: true, data: items });
};

// PATCH /api/schedule/:id  { scheduledFor?, status: 'cancelled' }
const updateScheduled = (req, res) => {
  const post = scheduled.find((s) => s.id === req.params.id);
  if (!post || post.userId !== req.user.id) return res.status(404).json({ success: false, error: 'Scheduled post not found.' });
  if (post.status === 'published') return res.status(400).json({ success: false, error: 'Already published.' });

  const patch = {};
  if (req.body.scheduledFor) {
    const when = new Date(req.body.scheduledFor);
    if (isNaN(when.getTime())) return res.status(400).json({ success: false, error: 'Invalid time.' });
    patch.scheduledFor = when.toISOString();
    patch.status = 'scheduled';
  }
  if (req.body.status === 'cancelled') patch.status = 'cancelled';
  if (typeof req.body.content === 'string' && req.body.content.trim()) patch.content = req.body.content.trim();

  const updated = scheduled.update(post.id, patch);
  res.json({ success: true, data: updated });
};

// POST /api/schedule/:id/publish  — publish now (mock)
const publishNow = (req, res) => {
  const post = scheduled.find((s) => s.id === req.params.id);
  if (!post || post.userId !== req.user.id) return res.status(404).json({ success: false, error: 'Scheduled post not found.' });
  if (post.status === 'published') return res.status(400).json({ success: false, error: 'Already published.' });
  const published = publishPost(post.id);
  res.json({ success: true, data: published });
};

// DELETE /api/schedule/:id
const deleteScheduled = (req, res) => {
  const post = scheduled.find((s) => s.id === req.params.id);
  if (!post || post.userId !== req.user.id) return res.status(404).json({ success: false, error: 'Scheduled post not found.' });
  scheduled.remove(post.id);
  res.json({ success: true, message: 'Scheduled post removed.' });
};

module.exports = { createScheduled, listScheduled, updateScheduled, publishNow, deleteScheduled };
