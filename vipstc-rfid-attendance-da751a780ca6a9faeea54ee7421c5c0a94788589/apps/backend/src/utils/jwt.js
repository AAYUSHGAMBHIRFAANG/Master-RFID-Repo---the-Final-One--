import dotenv from 'dotenv';
dotenv.config({ path: './.env' });     // ← run this first

import jwt from 'jsonwebtoken';

const ACCESS_EXP = process.env.JWT_EXP || '15m';
const REFRESH_EXP = process.env.JWT_REFRESH_EXP || '7d';
const SECRET = process.env.JWT_SECRET;

/** ------------------------------------------------------------------
 *  Generic helpers
 *  ------------------------------------------------------------------ */
export const signAccess = (payload) =>
  jwt.sign(payload, SECRET, { expiresIn: ACCESS_EXP });

export const signRefresh = (payload) =>
  jwt.sign(payload, SECRET, { expiresIn: REFRESH_EXP });

export const verifyToken = (token) => jwt.verify(token, SECRET);   

/** ------------------------------------------------------------------
 *  Convenience creators
 *  ------------------------------------------------------------------ */
export const makeUserTokens = (user) => {
  const base = { sub: user.id, role: user.role };
  return { access: signAccess(base), refresh: signRefresh(base) };
};

export const makeDeviceToken = (deviceId) =>
  signAccess({ dev: deviceId, role: 'DEVICE' });
