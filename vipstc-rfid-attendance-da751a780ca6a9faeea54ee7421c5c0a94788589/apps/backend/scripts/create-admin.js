import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/create-admin.js <password>');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
await prisma.user.upsert({
  where: { email: 'admin@vips-tc.ac.in' },
  update: { passwordHash: hash },
  create: {
    email: 'admin@vips-tc.ac.in',
    passwordHash: hash,
    role: 'ADMIN'
  }
});
console.log('✅  Super-admin ready (admin@vips-tc.ac.in)');
await prisma.$disconnect();
