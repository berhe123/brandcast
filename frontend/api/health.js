module.exports = (req, res) => {
  res.json({
    status: 'OK',
    message: 'VibePost API is running',
    timestamp: new Date().toISOString()
  });
};
