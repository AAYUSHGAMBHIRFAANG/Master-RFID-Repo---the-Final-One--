import { Router } from 'express';
import { verifyDevice, recordHeartbeat } from '../services/deviceService.js';
import { prisma } from '../services/prisma.js';
import { makeDeviceToken, verifyToken } from '../utils/jwt.js';
import { asyncWrap } from '../middlewares/error.js';
import { isHexUid } from '../utils/validators.js';
import * as sessionSvc from '../services/sessionService.js';

export const deviceRouter = Router();

/* ---- POST /api/device/handshake -------------------------------------- */
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

/* ---- POST /api/device/auth  (teacher scan) --------------------------- */
deviceRouter.post(
  '/auth',
  asyncWrap(async (req, res) => {
    // DEVICE JWT already validated in verifyJWT middleware
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    const payload = verifyToken(token);
    const deviceId = payload.dev;

    const { uid } = req.body || {};
    if (!isHexUid(uid)) return res.status(400).json({ message: 'uid format' });

    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: { faculty: true }
    });
    if (!device || device.faculty.rfidUid.toLowerCase() !== uid.toLowerCase())
      return res.status(403).json({ message: 'wrong teacher card' });

    // Find or open a new session if teacher already opened in portal
    let session = await prisma.classSession.findFirst({
      where: { teacherId: device.facultyId, isClosed: false }
    });
    if (!session)
      session = await sessionSvc.openSession(device.facultyId, null); // sectionId filled later in portal

    await sessionSvc.attachDevice(session.id, deviceId);
    res.json({ sessionId: session.id });
  })
);
