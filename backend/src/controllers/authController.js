const auth = require('../services/authService');
const { publicUser } = require('../services/authService');

// POST /api/auth/email/start  { email }
const emailStart = async (req, res, next) => {
  try {
    const result = await auth.startEmailLogin(req.body.email);
    res.json({
      success: true,
      data: {
        email: result.email,
        delivered: result.delivered,
        devCode: result.devCode, // present only in demo mode
        message: result.delivered
          ? `We sent a 6-digit code to ${result.email}.`
          : `Email delivery isn't configured. Add a Resend or SendGrid API key to receive codes.`,
      },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/email/verify  { email, code }
const emailVerify = (req, res, next) => {
  try {
    const { email, code } = req.body;
    const result = auth.verifyEmailLogin(email, code);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// POST /api/auth/google  { credential } | { profile }
const google = async (req, res, next) => {
  try {
    const result = await auth.loginWithGoogle({ credential: req.body.credential, profile: req.body.profile });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// GET /api/auth/me  (requireAuth)
const me = (req, res) => {
  res.json({ success: true, data: { user: publicUser(req.user) } });
};

module.exports = { emailStart, emailVerify, google, me };
