import { prisma } from './prisma.js';

export async function verifyDevice(mac, secret) {
  const dev = await prisma.device.findUnique({ where: { macAddr: mac } });
  if (!dev || dev.secret !== secret) return null;
  return dev;
}

export async function recordHeartbeat(deviceId) {
  return prisma.device.update({
    where: { id: deviceId },
    data: { lastBootAt: new Date() }
  });
}
