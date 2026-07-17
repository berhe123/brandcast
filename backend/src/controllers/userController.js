/**
 * User management (admin).
 * List team members, change roles, enable/disable accounts, and remove users.
 * Guard rails: an admin cannot disable, demote, or delete their own account, and
 * the last remaining admin cannot be demoted/removed (so you never lock yourself out).
 */

const { users, content, scheduled } = require('../db/store');
const { publicUser } = require('../services/authService');

const adminCount = () => users.filter((u) => u.role === 'admin' && u.status === 'active').length;

// GET /api/users  (admin) — team list with lightweight per-user activity counts.
const listUsers = (req, res) => {
  const data = users.all().map((u) => ({
    ...publicUser(u),
    lastLoginAt: u.lastLoginAt || null,
    contentCount: content.filter((c) => c.userId === u.id).length,
    scheduledCount: scheduled.filter((s) => s.userId === u.id).length,
  }));
  res.json({ success: true, data });
};

// PATCH /api/users/:id  (admin) — { role?, status? }
const updateUser = (req, res) => {
  const { id } = req.params;
  const { role, status } = req.body;
  const target = users.find((u) => u.id === id);
  if (!target) return res.status(404).json({ success: false, error: 'User not found.' });

  const isSelf = target.id === req.user.id;
  const patch = {};

  if (role && ['admin', 'member'].includes(role)) {
    if (isSelf && role !== 'admin') return res.status(400).json({ success: false, error: "You can't change your own role." });
    if (target.role === 'admin' && role === 'member' && adminCount() <= 1) {
      return res.status(400).json({ success: false, error: 'There must be at least one admin.' });
    }
    // Extra admins must be added via ADMIN_EMAILS env — UI can't grant lasting admin
    if (role === 'admin') {
      const { isAdminEmail } = require('../services/authService');
      if (!isAdminEmail(target.email)) {
        return res.status(400).json({
          success: false,
          error: 'Only emails in ADMIN_EMAILS can be admins. Add this email on Render, then redeploy.',
        });
      }
    }
    patch.role = role;
  }

  if (status && ['active', 'disabled'].includes(status)) {
    if (isSelf && status === 'disabled') return res.status(400).json({ success: false, error: "You can't disable your own account." });
    if (target.role === 'admin' && status === 'disabled' && adminCount() <= 1) {
      return res.status(400).json({ success: false, error: 'Cannot disable the last active admin.' });
    }
    patch.status = status;
  }

  const updated = users.update(id, patch);
  res.json({ success: true, data: publicUser(updated) });
};

// DELETE /api/users/:id  (admin)
const deleteUser = (req, res) => {
  const { id } = req.params;
  const target = users.find((u) => u.id === id);
  if (!target) return res.status(404).json({ success: false, error: 'User not found.' });
  if (target.id === req.user.id) return res.status(400).json({ success: false, error: "You can't delete your own account." });
  if (target.role === 'admin' && adminCount() <= 1) {
    return res.status(400).json({ success: false, error: 'Cannot delete the last active admin.' });
  }
  users.remove(id);
  res.json({ success: true, message: 'User removed.' });
};

module.exports = { listUsers, updateUser, deleteUser };
