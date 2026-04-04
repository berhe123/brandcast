// History is managed client-side (AppContext). This endpoint is a no-op stub kept for API compatibility.
module.exports = (req, res) => {
  if (req.method === 'GET') {
    return res.json({ success: true, data: [] });
  }
  res.status(405).json({ success: false, error: 'Method not allowed' });
};
