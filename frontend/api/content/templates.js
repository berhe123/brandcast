const { contentTemplates } = require('../_lib/sampleData');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  const { platform } = req.query;
  let templates = contentTemplates;
  if (platform && platform !== 'all') {
    templates = contentTemplates.filter(t =>
      t.platform.toLowerCase() === platform.toLowerCase() || t.platform === 'all'
    );
  }
  res.json({ success: true, data: templates });
};
