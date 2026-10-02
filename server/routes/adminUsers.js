import { Router } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Market } from '../models/Market.js';
import { Result } from '../models/Result.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Auth applies to every route in this file...
router.use(requireAuth);

// ...but super_admin is required PER ROUTE, not router-wide.
// Applying requireRole here would also block /markets and /results, which
// normal admins must be able to use for their own markets.

/** Never let the system end up with zero active super admins. */
async function activeSuperAdminCount(excludeId = null) {
  const filter = { role: 'super_admin', active: true };
  if (excludeId) filter._id = { $ne: excludeId };
  return User.countDocuments(filter);
}

/** GET /api/admin/users - list admins with per-admin market metrics. */
router.get('/users', requireRole('super_admin'), async (req, res) => {
  const users = await User.find().sort({ createdAt: 1 }).lean();

  const ownerIds = users.map((u) => u._id);

  // Declared-result counts per owner, joined through market -> createdBy.
  const resultCounts = await Result.aggregate([
    { $lookup: { from: 'markets', localField: 'market', foreignField: '_id', as: 'm' } },
    { $unwind: '$m' },
    { $match: { 'm.createdBy': { $in: ownerIds } } },
    { $group: { _id: '$m.createdBy', results: { $sum: 1 } } },
  ]);

  const [marketCounts, resultsByOwner] = await Promise.all([
    Market.ownerCounts(ownerIds),
    Promise.resolve(new Map(resultCounts.map((r) => [String(r._id), r.results]))),
  ]);

  res.json({
    ok: true,
    count: users.length,
    data: users.map((u) => {
      const counts = marketCounts.get(String(u._id)) ?? { total: 0, active: 0 };
      return {
        id: String(u._id),
        username: u.username,
        role: u.role,
        active: u.active,
        disabledAt: u.disabledAt,
        disabledReason: u.disabledReason,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        marketsTotal: counts.total,
        marketsActive: counts.active,
        marketsHidden: counts.total - counts.active,
        resultsDeclared: resultsByOwner.get(String(u._id)) ?? 0,
      };
    }),
  });
});

/** POST /api/admin/users - create an admin. */
router.post('/users', requireRole('super_admin'), async (req, res) => {
  const { username, password, role } = req.body ?? {};

  const name = String(username ?? '').trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,32}$/.test(name)) {
    return res.status(400).json({
      ok: false,
      error: 'Username must be 3-32 characters (letters, numbers, dot, dash, underscore)',
    });
  }
  if (!password || String(password).length < 8) {
    return res.status(400).json({ ok: false, error: 'Password must be at least 8 characters' });
  }
  if (!['admin', 'editor', 'super_admin'].includes(role ?? 'admin')) {
    return res.status(400).json({ ok: false, error: 'Role must be admin, editor or super_admin' });
  }

  if (await User.exists({ username: name })) {
    return res.status(409).json({ ok: false, error: `Username "${name}" is already taken` });
  }

  const user = await User.create({
    username: name,
    passwordHash: await User.hashPassword(String(password)),
    role: role ?? 'admin',
  });

  res.status(201).json({
    ok: true,
    data: {
      id: String(user._id),
      username: user.username,
      role: user.role,
      active: user.active,
      marketsTotal: 0,
      marketsActive: 0,
      resultsDeclared: 0,
    },
  });
});

/**
 * PATCH /api/admin/users/:id - activate/deactivate, or change role.
 *
 * Deactivating an admin ALSO hides every market they created, so those
 * markets leave the public site immediately. Re-activating restores them.
 * Send { cascade: false } to lock the account but keep markets published.
 */
router.patch('/users/:id', requireRole('super_admin'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ ok: false, error: 'Invalid user id' });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

  const { active, role, reason, cascade } = req.body ?? {};
  const wantsActive = active === undefined ? user.active : Boolean(active);

  // Safety: the last active super admin must stay active.
  if (user.role === 'super_admin' && !wantsActive) {
    if ((await activeSuperAdminCount(user._id)) === 0) {
      return res
        .status(400)
        .json({ ok: false, error: 'Cannot deactivate the last active super admin' });
    }
  }

  // Safety: don't let the only super admin demote themselves out of the role.
  if (role && role !== 'super_admin' && user.role === 'super_admin') {
    if ((await activeSuperAdminCount(user._id)) === 0) {
      return res
        .status(400)
        .json({ ok: false, error: 'Cannot demote the last active super admin' });
    }
  }

  if (active !== undefined) {
    user.active = Boolean(active);
    user.disabledAt = user.active ? null : new Date();
    user.disabledReason = user.active ? '' : String(reason ?? '').slice(0, 200);
  }

  if (role && ['admin', 'editor', 'super_admin'].includes(role)) {
    user.role = role;
  }

  await user.save();

  // Cascade: hide/show the markets this admin owns.
  let marketsChanged = 0;
  const shouldCascade = cascade !== false;
  if (active !== undefined && shouldCascade) {
    const upd = await Market.setOwnerActive(user._id, user.active);
    marketsChanged = upd.modifiedCount ?? 0;
  }

  res.json({
    ok: true,
    cascaded: active !== undefined && shouldCascade,
    marketsChanged,
    data: {
      id: String(user._id),
      username: user.username,
      role: user.role,
      active: user.active,
      disabledReason: user.disabledReason,
    },
  });
});



/**
 * DELETE /api/admin/users/:id - remove an admin and everything they own.
 * ?keepMarkets=true transfers their markets to the acting super admin
 * instead of deleting them.
 */
router.delete('/users/:id', requireRole('super_admin'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ ok: false, error: 'Invalid user id' });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

  if (String(user._id) === String(req.user._id)) {
    return res.status(400).json({ ok: false, error: 'You cannot delete your own account' });
  }
  if (user.role === 'super_admin' && (await activeSuperAdminCount(user._id)) === 0) {
    return res.status(400).json({ ok: false, error: 'Cannot delete the last active super admin' });
  }

  const keepMarkets = req.query.keepMarkets === 'true';
  let marketsDeleted = 0;
  let resultsDeleted = 0;

  if (keepMarkets) {
    // Hand their markets over to the acting super admin.
    await Market.updateMany({ createdBy: user._id }, { $set: { createdBy: req.user._id } });
  } else {
    const markets = await Market.find({ createdBy: user._id }).select('_id');
    const ids = markets.map((m) => m._id);

    if (ids.length) {
      const delRes = await Result.deleteMany({ market: { $in: ids } });
      resultsDeleted = delRes.deletedCount ?? 0;
    }
    const mRes = await Market.deleteMany({ createdBy: user._id });
    marketsDeleted = mRes.deletedCount ?? 0;
  }

  await user.deleteOne();

  res.json({ ok: true, marketsDeleted, resultsDeleted, marketsKept: keepMarkets });
});

export default router;

