// apps/backend/src/routes/device.js
import { Router } from 'express';
import { asyncWrap } from '../middlewares/error.js';
import { verifyDevice } from '../services/deviceService.js';
import { recordHeartbeat } from '../services/deviceService.js';
import { prisma } from '../services/prisma.js';
import { makeDeviceToken, verifyToken } from '../utils/jwt.js';
import { isHexUid } from '../utils/validators.js';
import * as sessionSvc from '../services/sessionService.js';
import { broadcast } from '../websocket.js';
export const deviceRouter = Router();

/* ───────────────── HELPERS ────────────────────────── */
function extractBearer(req) {
  const hdr = req.headers.authorization || '';
  return hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
}

/* middleware: verify device JWT, attach device row to req */
async function verifyDeviceJwt(req, _res, next) {
  try {
    const jwt = extractBearer(req);
    if (!jwt) throw new Error('missing jwt');
    const payload = verifyToken(jwt);
    const dev = await prisma.device.findUnique({
      where: { id: payload.dev },
      include: { faculty: true }
    });
    if (!dev) throw new Error('device not found');
    req.device      = dev;
    req.deviceToken = jwt;
    return next();
  } catch {
    return next({ status: 401, message: 'device jwt' });
  }
}

/* ───────── POST /handshake ────────────────────────── */
deviceRouter.post(
  '/handshake',
  asyncWrap(async (req, res) => {
    const { mac, secret } = req.body || {};
    const dev = await verifyDevice(mac, secret);
    if (!dev) return res.sendStatus(404);

    const token = makeDeviceToken(dev.id);
    await recordHeartbeat(dev.id);

    res.json({ jwt: token, serverTime: Date.now() });
  })
);

/* ───────── POST /auth (teacher RFID) ──────────────── */
deviceRouter.post(
  '/auth',
  verifyDeviceJwt,
  asyncWrap(async (req, res) => {
    const { uid } = req.body || {};
    if (!isHexUid(uid)) 
      return res.status(400).json({ message: 'uid format' });

    const dev = req.device;
    if (dev.faculty.rfidUid.toLowerCase() !== uid.toLowerCase())
      return res.status(403).json({ message: 'wrong teacher card' });

    // 1) find the *latest* open session, not just any
    let session = await prisma.classSession.findFirst({
      where: { teacherId: dev.facultyId, isClosed: false },
      orderBy: { startAt: 'desc' }
    });
    if (!session) {
      session = await sessionSvc.openSession(dev.facultyId, null);
    }

    // 2) attach this device
    await sessionSvc.attachDevice(session.id, dev.id);

    console.log(`📣 [device/auth] broadcasting auth:ok for session ${session.id}`);
    broadcast(session.id, 'auth:ok', {});

    // 3) reply to the ESP32
    res.json({ sessionId: session.id });
  })
);



/* ───────── GET /next-session  (device polls) ──────── */
deviceRouter.get(
  '/next-session',
  verifyDeviceJwt,
  asyncWrap(async (req, res) => {
    const sess = await prisma.classSession.findFirst({
      where: { teacherId: req.device.facultyId, isClosed: false },
      orderBy: { startAt: 'desc' }
    });
    res.json({ sessionId: sess ? sess.id : 0 });
  })
);
