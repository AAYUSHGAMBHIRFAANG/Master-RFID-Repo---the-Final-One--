// scripts/addDemoTeacher.js
// Run:  npx dotenv -e .env -- node scripts/addDemoTeacher.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT = 10;

async function main() {
  /* ───────────────── 1. UPSERT USER + FACULTY ───────────────── */
  const user = await prisma.user.upsert({
    where: { email: 'demo.teacher@vipstc.edu.in' },
    update: {},
    create: {
      email: 'demo.teacher@vipstc.edu.in',
      passwordHash: await bcrypt.hash('Demo@123', SALT),
      role: 'TEACHER'
    }
  });

  const faculty = await prisma.faculty.upsert({
    where: { empId: 'T104' },
    update: { userId: user.id }, // just in case user was recreated
    create: {
      userId: user.id,
      empId: 'T104',
      name: 'Demo Teacher',
      phone: '9876543213',
      rfidUid: (Math.random().toString(16).slice(2) + '000000000000').slice(0, 12)
    }
  });

  /* ───────────────── 2. PICK 2 SECTIONS & 2 SUBJECTS ───────────────── */
  // First two sections by ID (adjust logic if you prefer specific names)
  const sections = await prisma.section.findMany({ take: 2, orderBy: { id: 'asc' } });
  if (sections.length < 2) throw new Error('Need at least 2 sections in DB.');

  // First two subjects by ID
  const subjects = await prisma.subject.findMany({ take: 2, orderBy: { id: 'asc' } });
  if (subjects.length < 2) throw new Error('Need at least 2 subjects in DB.');

  /* ───────────────── 3. UPSERT SUBJECT INSTANCES ───────────────── */
  for (const section of sections) {
    for (const subject of subjects) {
          // Find‑or‑create because we don't have a composite unique key
      const existing = await prisma.subjectInstance.findFirst({
        where: {
          subjectId: subject.id,
          sectionId: section.id,
          facultyId: faculty.id
        }
      });

      if (!existing) {
        await prisma.subjectInstance.create({
          data: {
            subjectId: subject.id,
            sectionId: section.id,
            facultyId: faculty.id
          }
        });
      }
    }

  console.log('✅  Demo teacher ready: demo.teacher@vipstc.edu.in / Demo@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  })}
