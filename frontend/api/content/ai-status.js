const { isRealApiKey } = require('../_lib/aiService');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  res.json({
    success: true,
    data: {
      hasApiKey: isRealApiKey(),
      mode: isRealApiKey() ? 'claude' : 'demo',
      message: isRealApiKey()
        ? 'Claude AI is active'
        : 'Demo mode — add ANTHROPIC_API_KEY to Vercel environment variables for Claude AI'
    }
  });
};
