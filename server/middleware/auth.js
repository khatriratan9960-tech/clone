import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../models/User.js';

/** Sign a token for a user document. */
export function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

function readToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

/** Reject the request unless it carries a valid, active user token. */
export async function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ ok: false, error: 'Authentication required' });

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user || !user.active) {
      return res.status(401).json({ ok: false, error: 'Account is inactive' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: 'Session expired, please log in again' });
  }
}

/** Restrict a route to specific roles. */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: 'Insufficient permissions' });
    }
    next();
  };
}
