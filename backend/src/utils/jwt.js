/**
 * Minimal JWT (HS256) — no external dependency.
 * Signs/verifies compact JSON Web Tokens using Node's crypto HMAC.
 * Good for first-party auth; swap for `jsonwebtoken` if you need more algorithms.
 */

const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
const b64url = (buf) => Buffer.from(buf).toString('base64url');

const sign = (payload, { expiresInSec = 60 * 60 * 24 * 30 } = {}) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { iat: now, exp: now + expiresInSec, ...payload };
  const head = b64url(JSON.stringify(header));
  const data = b64url(JSON.stringify(body));
  const sig = crypto.createHmac('sha256', SECRET).update(`${head}.${data}`).digest('base64url');
  return `${head}.${data}.${sig}`;
};

const verify = (token) => {
  if (!token || token.split('.').length !== 3) return null;
  const [head, data, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(`${head}.${data}`).digest('base64url');
  // Constant-time compare.
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
};

module.exports = { sign, verify };
