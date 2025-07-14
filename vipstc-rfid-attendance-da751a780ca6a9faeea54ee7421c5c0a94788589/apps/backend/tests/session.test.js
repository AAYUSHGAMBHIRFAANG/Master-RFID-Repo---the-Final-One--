import request from 'supertest';
import { prisma } from '../src/services/prisma.js';
import { createApp } from '../src/app.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

let teacherRfidUid;

const app = createApp();
const server = app.listen();

/* helper: random 12-char RFID UID */
const uid12 = () => crypto.randomBytes(6).toString('hex').toUpperCase();

let teacherJwt, section, device;

beforeAll(async () => {
  /* ---------- Teacher ---------- */
  const user = await prisma.user.create({
    data: {
      email: `t${Date.now()}@test.com`,
      passwordHash: await bcrypt.hash('pass', 10),
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
teacherRfidUid = faculty.rfidUid;
  /* ---------- Department -→ Course -→ Semester -→ Section ---------- */
const randHex = () => crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
const depCode = 'D' + randHex();                // e.g. D3E7AF
section = await prisma.section.create({
  data: {
    name: 'Sec_' + randHex(),
    semester: {
      create: {
        number: 1,
        type: 'odd',
        course: {
          create: {
            name: 'Course_' + randHex(),
            durationYears: 3,
            degreeType: 'UG',
            department: {
              create: { name: 'Dept_' + randHex(), code: depCode }
            }
          }
        }
      }
    }
  }
});


  /* ---------- Subject + mapping ---------- */
  const subj = await prisma.subject.create({
    data: { code: `SUB${Date.now()}`, name: 'TempSub' }
  });

  await prisma.subjectInstance.create({
    data: {
      subjectId: subj.id,
      sectionId: section.id,
      facultyId: faculty.id
    }
  });

  /* ---------- Device ---------- */
  device = await prisma.device.create({
    data: {
      macAddr:
        'AA:BB:CC:' + crypto.randomBytes(2).toString('hex').toUpperCase(),
      secret: crypto.randomBytes(8).toString('hex'),
      facultyId: faculty.id
    }
  });

  /* ---------- JWT ---------- */
  teacherJwt = (
    await request(server).post('/api/auth/login').send({
      email: user.email,
      password: 'pass'
    })
  ).body.access;
});

afterAll(async () => {
  await prisma.$disconnect();
  server.close();
});

it('teacher opens, device attaches, scan logs present', async () => {
  /* open */
  const { body: openBody, statusCode: openCode } = await request(server)
    .post('/api/session/open')
    .set('Authorization', `Bearer ${teacherJwt}`)
    .send({ sectionId: section.id });
  expect(openCode).toBe(201);
  const sessionId = openBody.sessionId;

  /* handshake */
  const dJwt = (
    await request(server)
      .post('/api/device/handshake')
      .send({ mac: device.macAddr, secret: device.secret })
  ).body.jwt;

  /* device auth */
  const authCode = (
    await request(server)
     .post('/api/device/auth')
     .set('Authorization', `Bearer ${dJwt}`)
     .send({ uid: teacherRfidUid })    // use the saved UID
  ).statusCode;


  /* new student */
  const student = await prisma.student.create({
    data: {
      name: 'S',
      rfidUid: uid12(),
      enrollmentNo: `ENR${Date.now()}`,
      sectionId: section.id
    }
  });

  /* scan */
  const scanCode = (
    await request(server)
      .post('/api/scan')
      .set('Authorization', `Bearer ${dJwt}`)
      .send({ uid: student.rfidUid, sessionId })
  ).statusCode;
  expect(scanCode).toBe(204);

  /* close */
  const closeCode = (
    await request(server)
      .patch(`/api/session/close/${sessionId}`)
      .set('Authorization', `Bearer ${teacherJwt}`)
  ).statusCode;
  expect(closeCode).toBe(200);
});
