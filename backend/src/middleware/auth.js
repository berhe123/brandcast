/**
 * Auth middleware.
 *   requireAuth  — rejects requests without a valid Bearer token; attaches
 *                  req.user (the full stored user record).
 *   requireAdmin — requireAuth + role === 'admin'.
 *   optionalAuth — attaches req.user when a valid token is present, else continues.
 */

const { verify } = require('../utils/jwt');
const { users } = require('../db/store');

const getUserFromReq = (req) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const payload = verify(token);
  if (!payload) return null;
  const user = users.find((u) => u.id === payload.sub);
  if (!user || user.status === 'disabled') return null;
  return user;
};

const requireAuth = (req, res, next) => {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ success: false, error: 'Authentication required.' });
  req.user = user;
  next();
};

const requireAdmin = (req, res, next) => {
  const user = getUserFromReq(req);
  if (!user) return res.status(401).json({ success: false, error: 'Authentication required.' });
  if (user.role !== 'admin') return res.status(403).json({ success: false, error: 'Admin access required.' });
  req.user = user;
  next();
};

const optionalAuth = (req, res, next) => {
  req.user = getUserFromReq(req) || null;
  next();
};

module.exports = { requireAuth, requireAdmin, optionalAuth };
