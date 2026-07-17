/**
 * Auth Service
 * -------------
 * Passwordless authentication (no email codes):
 *   • email   → enter email + Continue → signed in immediately
 *   • google  → Google Identity Services ID token when GOOGLE_CLIENT_ID is set;
 *               otherwise accepts an email profile so the flow still works
 *
 * Users live in the JSON store. Admin is NOT "first user wins".
 * Only emails listed in ADMIN_EMAILS (default: founder@brandcast.app) are admins.
 * Email matching is always case-insensitive.
 */

const { users } = require('../db/store');
const { sign } = require('../utils/jwt');

const normEmail = (e) => String(e || '').trim().toLowerCase();
const emailValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

/** Comma-separated allowlist. Everyone else is always a member. */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'founder@brandcast.app')
  .split(',')
  .map((e) => normEmail(e))
  .filter(Boolean);

const isAdminEmail = (email) => ADMIN_EMAILS.includes(normEmail(email));

const findByEmail = (email) => {
  const target = normEmail(email);
  return users.find((u) => normEmail(u.email) === target) || null;
};

/**
 * If duplicate emails exist (mixed casing), keep the best record and remove others.
 * Prefer: admin allowlist match > admin role > oldest createdAt.
 */
const dedupeEmailAccounts = (email) => {
  const target = normEmail(email);
  const matches = users.filter((u) => normEmail(u.email) === target);
  if (matches.length <= 1) return matches[0] || null;

  matches.sort((a, b) => {
    const aAllow = isAdminEmail(a.email) ? 1 : 0;
    const bAllow = isAdminEmail(b.email) ? 1 : 0;
    if (bAllow !== aAllow) return bAllow - aAllow;
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (b.role === 'admin' && a.role !== 'admin') return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const keep = matches[0];
  for (const dup of matches.slice(1)) {
    users.remove(dup.id);
  }
  return users.update(keep.id, {
    email: target,
    role: isAdminEmail(target) ? 'admin' : 'member',
  });
};

const findOrCreateUser = ({ email, name, avatar, provider }) => {
  const normalized = normEmail(email);
  let existing = dedupeEmailAccounts(normalized) || findByEmail(normalized);
  const role = isAdminEmail(normalized) ? 'admin' : 'member';

  if (existing) {
    const patch = {
      lastLoginAt: new Date().toISOString(),
      email: normalized,
      // Enforce allowlist every login — fixes accidental admins from "first user" bug
      role,
    };
    if (name && name !== existing.name) patch.name = name;
    if (avatar && !existing.avatar) patch.avatar = avatar;
    if (provider && !existing.provider) patch.provider = provider;
    users.update(existing.id, patch);
    return users.find((u) => u.id === existing.id);
  }

  return users.insert({
    email: normalized,
    name: name || normalized.split('@')[0],
    avatar: avatar || null,
    provider: provider || 'email',
    role,
    status: 'active',
    lastLoginAt: new Date().toISOString(),
  });
};

/** One-shot: demote anyone who is not on the admin allowlist. */
const enforceAdminAllowlist = () => {
  const all = users.all() || [];
  let fixed = 0;
  for (const u of all) {
    const shouldBeAdmin = isAdminEmail(u.email);
    const nextRole = shouldBeAdmin ? 'admin' : 'member';
    if (u.role !== nextRole) {
      users.update(u.id, { role: nextRole, email: normEmail(u.email) });
      fixed += 1;
    }
  }
  if (fixed) {
    console.log(`[auth] Synced roles for ${fixed} user(s). Admins: ${ADMIN_EMAILS.join(', ')}`);
  }
};

const publicUser = (u) => u && ({
  id: u.id,
  email: u.email,
  name: u.name,
  avatar: u.avatar,
  role: u.role,
  status: u.status,
  provider: u.provider,
  createdAt: u.createdAt,
  lastLoginAt: u.lastLoginAt || u.createdAt,
});

const issueToken = (u) => sign({ sub: u.id, email: u.email, role: u.role });

/** Instant email login — no OTP / no verification code. */
const loginWithEmail = (rawEmail, name) => {
  const email = normEmail(rawEmail);
  if (!emailValid(email)) {
    throw Object.assign(new Error('Please enter a valid email address.'), { status: 400 });
  }
  const user = findOrCreateUser({
    email,
    name: name || email.split('@')[0],
    provider: 'email',
  });
  return { token: issueToken(user), user: publicUser(user) };
};

/** Google sign-in via ID token (GIS) or email profile fallback. */
const loginWithGoogle = async ({ credential, profile }) => {
  let info = null;

  if (credential && process.env.GOOGLE_CLIENT_ID) {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!res.ok) throw Object.assign(new Error('Google sign-in failed.'), { status: 401 });
    const data = await res.json();
    if (data.aud !== process.env.GOOGLE_CLIENT_ID) {
      throw Object.assign(new Error('Invalid Google token audience.'), { status: 401 });
    }
    info = { email: data.email, name: data.name, avatar: data.picture };
  } else if (profile?.email) {
    const email = normEmail(profile.email);
    info = {
      email,
      name: profile.name || email.split('@')[0],
      avatar: profile.avatar || null,
    };
  } else {
    throw Object.assign(
      new Error('Google sign-in needs a credential or email. Set GOOGLE_CLIENT_ID for live Google login.'),
      { status: 400 }
    );
  }

  if (!emailValid(info.email)) {
    throw Object.assign(new Error('Google account has no usable email.'), { status: 400 });
  }
  const user = findOrCreateUser({ ...info, provider: 'google' });
  return { token: issueToken(user), user: publicUser(user) };
};

const startEmailLogin = async (rawEmail) => loginWithEmail(rawEmail);
const verifyEmailLogin = (rawEmail) => loginWithEmail(rawEmail);

module.exports = {
  loginWithEmail,
  startEmailLogin,
  verifyEmailLogin,
  loginWithGoogle,
  findOrCreateUser,
  publicUser,
  issueToken,
  findByEmail,
  dedupeEmailAccounts,
  enforceAdminAllowlist,
  ADMIN_EMAILS,
  isAdminEmail,
};
