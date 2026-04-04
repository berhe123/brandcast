const { samplePosts } = require('../_lib/sampleData');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  const { platform } = req.query;
  let posts = samplePosts;
  if (platform && platform !== 'all') {
    posts = samplePosts.filter(p => p.platform.toLowerCase() === platform.toLowerCase());
  }
  res.json({ success: true, data: posts });
};
