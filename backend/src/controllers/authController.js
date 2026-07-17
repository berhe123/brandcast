const auth = require('../services/authService');
const { publicUser } = require('../services/authService');

// POST /api/auth/email/login  { email, name? }  — instant login, no code
const emailLogin = (req, res, next) => {
  try {
    const result = auth.loginWithEmail(req.body.email, req.body.name);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// Legacy aliases — same as instant login (no OTP)
const emailStart = emailLogin;
const emailVerify = emailLogin;

// POST /api/auth/google  { credential } | { profile }
const google = async (req, res, next) => {
  try {
    const result = await auth.loginWithGoogle({
      credential: req.body.credential,
      profile: req.body.profile,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// GET /api/auth/me
const me = (req, res) => {
  res.json({ success: true, data: { user: publicUser(req.user) } });
};

// GET /api/auth/config — public client ids for the login page
const authConfig = (req, res) => {
  res.json({
    success: true,
    data: {
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      googleEnabled: Boolean(process.env.GOOGLE_CLIENT_ID),
    },
  });
};

module.exports = { emailLogin, emailStart, emailVerify, google, me, authConfig };
