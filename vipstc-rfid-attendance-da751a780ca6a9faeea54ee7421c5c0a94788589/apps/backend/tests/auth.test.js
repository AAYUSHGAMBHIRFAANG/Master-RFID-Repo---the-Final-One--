import request from 'supertest';
import { prisma } from '../src/services/prisma.js';
import { createApp } from '../src/app.js';   // factory exported at bottom of app.js

const app = createApp();
const server = app.listen();                 // ephemeral port for Supertest

afterAll(async () => {
  await prisma.$disconnect();
  server.close();
});

describe('Auth routes', () => {
  it('logs in admin and returns access token', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ email: 'admin@vips-tc.ac.in', password: 'Admin@123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.access).toBeDefined();
  });

  it('refreshes token', async () => {
    const login = await request(server)
      .post('/api/auth/login')
      .send({ email: 'admin@vips-tc.ac.in', password: 'Admin@123' });

    const res = await request(server)
      .post('/api/auth/refresh')
      .send({ refresh: login.body.refresh });

    expect(res.statusCode).toBe(200);
    expect(res.body.access).toBeDefined();
  });
});
