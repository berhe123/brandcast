// History is managed client-side. This stub accepts DELETE for API compatibility.
module.exports = (req, res) => {
  if (req.method === 'DELETE') {
    return res.json({ success: true, message: 'Item deleted successfully' });
  }
  res.status(405).json({ success: false, error: 'Method not allowed' });
};
