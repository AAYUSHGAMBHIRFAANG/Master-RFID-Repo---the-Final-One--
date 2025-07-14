import { verifyToken } from '../utils/jwt.js';

/** ACCESS TOKEN VERIFICATION */
export function verifyJWT(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.sendStatus(401);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.sendStatus(401);
  }
}

/** ROLE HIERARCHY  (ADMIN > PCOORD > TEACHER > DEVICE) */
const hierarchy = ['DEVICE', 'TEACHER', 'PCOORD', 'ADMIN'];

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const { role } = req.user;
    if (!allowedRoles.includes(role)) return res.sendStatus(401);
    next();
  };
}
