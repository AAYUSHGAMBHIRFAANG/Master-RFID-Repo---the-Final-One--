import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../services/prisma.js';
import { makeUserTokens, verifyToken, signAccess } from '../utils/jwt.js';
import { asyncWrap } from '../middlewares/error.js';

export const authRouter = Router();

/* ---------- POST /api/auth/login ---------- */
authRouter.post(
  '/login',
  asyncWrap(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.sendStatus(400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.sendStatus(401);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.sendStatus(401);

    return res.json(makeUserTokens(user));
  })
);

/* ---------- POST /api/auth/refresh ---------- */
authRouter.post(
  '/refresh',
  asyncWrap(async (req, res) => {
    const { refresh } = req.body || {};
    if (!refresh) return res.sendStatus(400);

    let payload;
    try {
      payload = verifyToken(refresh);
    } catch {
      return res.sendStatus(401);
    }
    // Optional: check token rotation jti here
    const access = signAccess({ sub: payload.sub, role: payload.role });
    return res.json({ access });
  })
);
