// apps/backend/tests/ws.test.js
import WebSocket from 'ws';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/services/prisma.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const app = createApp();
let server, WS_URL;

function uid12() {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

let teacherJwt, sessionId, dJwt, studentId, studentUid;

beforeAll(async () => {
    server = app.listen();                    // ephemeral port
  const { port } = server.address();        // get that port
  WS_URL = `ws://localhost:${port}/ws/session`;
  // 1) Create teacher user + faculty
  const user = await prisma.user.create({
    data: {
      email: `ws${Date.now()}@test.com`,
      passwordHash: await bcrypt.hash('pass', 10),
      role: 'TEACHER'
    }
  });
  const faculty = await prisma.faculty.create({
    data: {
      userId: user.id,
      empId: 'EMP' + Date.now(),
      name: 'WS Teacher',
      phone: '000',
      rfidUid: uid12()
    }
  });
  const teacherRfid = faculty.rfidUid;

  // 2) Create section (with course/department) & subjectInstance
  const depCode = 'D' + uid12();
  const section = await prisma.section.create({
    data: {
      name: 'WSec_' + uid12(),
      semester: {
        create: {
          number: 1,
          type: 'odd',
          course: {
            create: {
              name: 'WCourse_' + uid12(),
              durationYears: 3,
              degreeType: 'UG',
              department: { create: { name: 'WDept', code: depCode } }
            }
          }
        }
      }
    }
  });
  const subj = await prisma.subject.create({
    data: { code: `S${Date.now()}`, name: 'WSSub' }
  });
  await prisma.subjectInstance.create({
    data: {
      subjectId: subj.id,
      sectionId: section.id,
      facultyId: faculty.id
    }
  });

  // 3) Create a student
  const student = await prisma.student.create({
    data: {
      name: 'WS Student',
      rfidUid: (studentUid = uid12()),
      enrollmentNo: `ENR${Date.now()}`,
      sectionId: section.id
    }
  });
  studentId = student.id;

  // 4) Teacher login → JWT
  const login = await request(server)
    .post('/api/auth/login')
    .send({ email: user.email, password: 'pass' });
  teacherJwt = login.body.access;

  // 5) Open session
  const open = await request(server)
    .post('/api/session/open')
    .set('Authorization', `Bearer ${teacherJwt}`)
    .send({ sectionId: section.id });
  sessionId = open.body.sessionId;

  // 6) Device handshake → dJwt
  // First create a device row for this faculty:
  const device = await prisma.device.create({
    data: {
      macAddr: 'AA:BB:CC:' + uid12().slice(0, 6),
      secret: uid12(),
      facultyId: faculty.id
    }
  });
  const hs = await request(server)
    .post('/api/device/handshake')
    .send({ mac: device.macAddr, secret: device.secret });
  dJwt = hs.body.jwt;
});

afterAll(async () => {
  server.close();
  await prisma.$disconnect();
});

test('WebSocket attendance broadcast', (done) => {
  const ws = new WebSocket(`${WS_URL}/${sessionId}`);

  ws.on('message', (msg) => {
    const { event, data } = JSON.parse(msg);

    if (event === 'attendance:snapshot') {
      // Got initial snapshot array
      expect(Array.isArray(data)).toBe(true);

      // Now simulate a scan with our real studentUid
      request(server)
        .post('/api/scan')
        .set('Authorization', `Bearer ${dJwt}`)
        .send({ uid: studentUid, sessionId })
        .end(() => {});
    } else if (event === 'attendance:add') {
      // Delta arrives
      expect(data.studentId).toBe(studentId);
      expect(data.name).toBeDefined();
      ws.close();
      done();
    }
  });
});
