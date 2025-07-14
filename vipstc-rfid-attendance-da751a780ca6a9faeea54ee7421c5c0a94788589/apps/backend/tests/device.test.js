import request from 'supertest';
import { prisma } from '../src/services/prisma.js';
import { createApp } from '../src/app.js';
import crypto from 'crypto';
const uid12 = () => crypto.randomBytes(6).toString('hex').toUpperCase(); // 12-char UID

const app = createApp();
const server = app.listen();

let devRecord;

beforeAll(async () => {
  // create a throw-away faculty & device for this test
  const user = await prisma.user.create({
    data: {
      email: `t${Date.now()}@test.com`,
      passwordHash: '$2b$10$M7nhiXoIp8qJgq1oMXgnmOdD0N2QwdRG2Yq/PykqFprnSE6iFlb7m', // "pass"
      role: 'TEACHER'
    }
  });
  const faculty = await prisma.faculty.create({
    data: {
      userId: user.id,
      empId: 'EMP' + Date.now(),
      name: 'Temp Teacher',
      phone: '000',
      rfidUid: uid12()
    }
  });
  devRecord = await prisma.device.create({
    data: {
      macAddr: 'AA:BB:CC:' + crypto.randomBytes(2).toString('hex').toUpperCase(),
      secret: crypto.randomBytes(8).toString('hex'),
      facultyId: faculty.id
    }
  });
});

afterAll(async () => {
  if (devRecord) await prisma.device.delete({ where: { id: devRecord.id } });
  await prisma.$disconnect();
  server.close();
});


describe('Device handshake', () => {
  it('returns jwt for known device', async () => {
    const res = await request(server).post('/api/device/handshake').send({
      mac: devRecord.macAddr,
      secret: devRecord.secret
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.jwt).toBeDefined();
  });
});
