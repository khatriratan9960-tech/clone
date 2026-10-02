import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { config } from '../config.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * Create the bootstrap admin if no users exist yet.
 * The very first account is always a super_admin so the system can never
 * be bootstrapped into a state where nobody can create other admins.
 */
export async function ensureSeedAdmin() {
  const count = await User.countDocuments();
  if (count > 0) return null;

  const passwordHash = await User.hashPassword(config.admin.password);
  const user = await User.create({
    username: config.admin.username,
    passwordHash,
    role: 'super_admin',
  });

  console.log(`[auth] seeded super admin "${user.username}"`);
  return user;
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ ok: false, error: 'Username and password are required' });
  }

  const user = await User.findOne({ username: String(username).toLowerCase() });

  // Same message for unknown user and wrong password - don't leak which.
  if (!user || !(await user.verifyPassword(password))) {
    return res.status(401).json({ ok: false, error: 'Invalid username or password' });
  }
  if (!user.active) {
    return res.status(403).json({ ok: false, error: 'Account is disabled' });
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    ok: true,
    token: signToken(user),
    user: { id: String(user._id), username: user.username, role: user.role },
  });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({
    ok: true,
    user: {
      id: String(req.user._id),
      username: req.user.username,
      role: req.user.role,
      lastLoginAt: req.user.lastLoginAt,
    },
  });
});

/** Change your own password. */
router.post('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ ok: false, error: 'New password must be at least 8 characters' });
  }
  if (!(await req.user.verifyPassword(currentPassword ?? ''))) {
    return res.status(401).json({ ok: false, error: 'Current password is incorrect' });
  }

  req.user.passwordHash = await User.hashPassword(newPassword);
  await req.user.save();

  res.json({ ok: true });
});

export default router;
