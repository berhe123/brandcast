module.exports = (req, res) => {
  res.json({
    status: 'OK',
    message: 'mySWOOOP Marketing API is running',
    timestamp: new Date().toISOString()
  });
};
