const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.constructor?.name || 'Error'}: ${err.message}`);

  // Custom status errors (e.g. rate limit, bad request)
  if (err.status) {
    return res.status(err.status).json({ success: false, error: err.message });
  }

  // Anthropic SDK auth errors
  const msg = err.message || '';
  const errName = err.constructor?.name || err.name || '';
  if (
    errName === 'AuthenticationError' ||
    err.status === 401 || err.status === 403 ||
    msg.toLowerCase().includes('authentication') ||
    msg.toLowerCase().includes('x-api-key') ||
    msg.toLowerCase().includes('api_key') ||
    msg.toLowerCase().includes('api key')
  ) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or missing Anthropic API key. Please update ANTHROPIC_API_KEY in backend/.env'
    });
  }

  // Anthropic generic API errors
  if (
    errName.includes('APIError') ||
    errName.includes('AnthropicError') ||
    msg.includes('anthropic')
  ) {
    return res.status(503).json({
      success: false,
      error: 'AI service unavailable. Please try again in a moment.'
    });
  }

  // Always expose the real error message in development
  res.status(500).json({
    success: false,
    error: err.message || 'An unexpected error occurred. Please try again.'
  });
};

module.exports = { errorHandler };
