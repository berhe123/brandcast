module.exports = (req, res) => {
  res.json({
    status: 'OK',
    message: 'Brandcast API is running',
    timestamp: new Date().toISOString()
  });
};
