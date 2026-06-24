/**
 * Auth Service
 * -------------
 * Passwordless, Claude-style authentication:
 *   • email   → a 6-digit one-time code is generated, stored with an expiry, and
 *               "sent". With no email provider configured (demo), the code is
 *               returned to the caller / logged so the flow works end-to-end.
 *               Wire a real provider (Resend/SendGrid) in `deliverCode()` later.
 *   • google  → verifies a Google ID token when GOOGLE_CLIENT_ID is set; in demo
 *               it accepts a lightweight profile so the button is fully functional.
 *
 * Users live in the JSON store. The first user ever created becomes `admin`.
 */

const crypto = require('crypto');
const { users } = require('../db/store');
const { sign } = require('../utils/jwt');

// email -> { code, expires, attempts }
const pendingCodes = new Map();
const CODE_TTL_MS = 10 * 60 * 1000;

const normEmail = (e) => String(e || '').trim().toLowerCase();
const emailValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const hasEmailProvider = () => Boolean(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY);

/** Replace with a real provider call. Returns true if actually delivered. */
const deliverCode = async (email, code) => {
  if (!hasEmailProvider()) {
    console.log(`\n[auth] DEMO login code for ${email}: ${code}\n`);
    return false; // not really sent — caller will surface the demo code
  }
  // TODO: integrate Resend/SendGrid here when keys are present.
  return true;
};

const findOrCreateUser = ({ email, name, avatar, provider }) => {
  const existing = users.find((u) => u.email === email);
  if (existing) {
    const patch = {};
    if (name && !existing.name) patch.name = name;
    if (avatar && !existing.avatar) patch.avatar = avatar;
    if (Object.keys(patch).length) users.update(existing.id, patch);
    users.update(existing.id, { lastLoginAt: new Date().toISOString() });
    return users.find((u) => u.id === existing.id);
  }
  const isFirst = users.all().length === 0;
  return users.insert({
    email,
    name: name || email.split('@')[0],
    avatar: avatar || null,
    provider: provider || 'email',
    role: isFirst ? 'admin' : 'member', // first account bootstraps the admin
    status: 'active',
    lastLoginAt: new Date().toISOString(),
  });
};

const publicUser = (u) => u && ({
  id: u.id, email: u.email, name: u.name, avatar: u.avatar,
  role: u.role, status: u.status, provider: u.provider, createdAt: u.createdAt,
});

const issueToken = (u) => sign({ sub: u.id, email: u.email, role: u.role });

// ─── Email OTP flow ─────────────────────────────────────────────────────────
const startEmailLogin = async (rawEmail) => {
  const email = normEmail(rawEmail);
  if (!emailValid(email)) throw Object.assign(new Error('Please enter a valid email address.'), { status: 400 });

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  pendingCodes.set(email, { code, expires: Date.now() + CODE_TTL_MS, attempts: 0 });
  const delivered = await deliverCode(email, code);

  return {
    email,
    delivered,
    // Only expose the code when we couldn't actually email it (demo mode).
    devCode: delivered ? undefined : code,
  };
};

const verifyEmailLogin = (rawEmail, code) => {
  const email = normEmail(rawEmail);
  const entry = pendingCodes.get(email);
  if (!entry) throw Object.assign(new Error('No code requested. Start again.'), { status: 400 });
  if (Date.now() > entry.expires) {
    pendingCodes.delete(email);
    throw Object.assign(new Error('Code expired. Request a new one.'), { status: 400 });
  }
  if (entry.attempts >= 5) {
    pendingCodes.delete(email);
    throw Object.assign(new Error('Too many attempts. Request a new code.'), { status: 429 });
  }
  if (String(code).trim() !== entry.code) {
    entry.attempts += 1;
    throw Object.assign(new Error('Incorrect code. Please try again.'), { status: 401 });
  }
  pendingCodes.delete(email);
  const user = findOrCreateUser({ email, provider: 'email' });
  return { token: issueToken(user), user: publicUser(user) };
};

// ─── Google flow ──────────────────────────────────────────────────────────
const loginWithGoogle = async ({ credential, profile }) => {
  let info = null;

  if (credential && process.env.GOOGLE_CLIENT_ID) {
    // Real path: validate the Google ID token.
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!res.ok) throw Object.assign(new Error('Google sign-in failed.'), { status: 401 });
    const data = await res.json();
    if (data.aud !== process.env.GOOGLE_CLIENT_ID) throw Object.assign(new Error('Invalid Google token.'), { status: 401 });
    info = { email: data.email, name: data.name, avatar: data.picture };
  } else {
    // Demo path: accept a provided profile, or synthesise a demo Google user.
    const email = normEmail(profile?.email) || `demo.user.${crypto.randomInt(1000, 9999)}@gmail.com`;
    info = { email, name: profile?.name || email.split('@')[0], avatar: profile?.avatar || null };
  }

  if (!emailValid(info.email)) throw Object.assign(new Error('Google account has no usable email.'), { status: 400 });
  const user = findOrCreateUser({ ...info, provider: 'google' });
  return { token: issueToken(user), user: publicUser(user) };
};

module.exports = {
  startEmailLogin,
  verifyEmailLogin,
  loginWithGoogle,
  findOrCreateUser,
  publicUser,
  issueToken,
};
