// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const subjects = [
  { code: 'BCA101T', name: 'Programming for Problem Solving using C' },
  { code: 'BCA103T', name: 'Fundamental of Information Technology' },
  { code: 'BCA105T', name: 'Web Technologies' },
  { code: 'BCA107T', name: 'Mathematical Foundation for Computer Science' },
  { code: 'BCA101P', name: 'Programming for Problem Solving using C Lab' },
  { code: 'BCA103P', name: 'Fundamental of Information Technology Lab' },
  { code: 'BCA105P', name: 'Web Technologies Lab' },
  { code: 'BCA141T', name: 'Writing Skills' },
  { code: 'BCA191T', name: 'Understanding India' },
  { code: 'BCA181T', name: 'Bridge Course in Mathematics' },
  { code: 'BCA102T', name: 'Database Management System' },
  { code: 'BCA104T', name: 'Object Oriented Programming using Java' },
  { code: 'BCA106T', name: 'Data Structures and Algorithms' },
  { code: 'BCA108T', name: 'Software Engineering' },
  { code: 'BCA102P', name: 'Database Management System Lab' },
  { code: 'BCA104P', name: 'Object Oriented Programming using Java Lab' },
  { code: 'BCA106P', name: 'Data Structures and Algorithms Lab' },
  { code: 'BCA108P', name: 'Software Engineering Lab' },
  { code: 'BCA142T', name: 'Soft Skills' },
  { code: 'BCA192T', name: 'Environment Studies' },
  { code: 'BCA201T', name: 'Python Programming' },
  { code: 'BCA203T', name: 'Dynamic Web Designing' },
  { code: 'BCA205T', name: 'Computer Organization and Architecture' },
  { code: 'BCA207T', name: 'Discrete Mathematics' },
  { code: 'BCA201P', name: 'Python Programming Lab' },
  { code: 'BCA203P', name: 'Dynamic Web Designing Lab' },
  { code: 'BCA205P', name: 'Computer Organization and Architecture Lab' }
];

async function seed() {
  console.log(`🌱 Seeding database...`);

  await prisma.attendanceLog.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.device.deleteMany();
  await prisma.student.deleteMany();
  await prisma.subjectInstance.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.section.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.course.deleteMany();
  await prisma.department.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();

  // Create department and course
  const dept = await prisma.department.create({
    data: {
      code: 'BCA',
      name: 'Computer Applications',
      courses: {
        create: {
          name: 'Bachelor of Computer Applications',
          durationYears: 3,
          degreeType: 'UG',
        },
      },
    },
    include: { courses: true }
  });

  const course = dept.courses[0];

  // Create semesters and sections
  const semesters = [];
  for (let i = 1; i <= 6; i++) {
    const sem = await prisma.semester.create({
      data: {
        number: i,
        type: i % 2 === 0 ? 'even' : 'odd',
        courseId: course.id,
      },
    });

    for (const secName of ['A', 'B']) {
      const section = await prisma.section.create({
        data: {
          name: `BCA${i}${secName}`,
          semesterId: sem.id,
        },
      });

      // Add 5 students
      for (let j = 1; j <= 5; j++) {
        await prisma.student.create({
          data: {
            name: `Student ${i}${secName}${j}`,
            enrollmentNo: `BCA${i}${secName}${j}`,
            phone: `9990000${i}${j}`,
            rfidUid: `${i}${secName}${j}`.padStart(12, '0'),
            sectionId: section.id,
          },
        });
      }
    }

    semesters.push(sem);
  }

  // Add subjects
  await prisma.subject.createMany({ data: subjects });

  // Create real teacher and 2 sample teachers
  const users = await prisma.user.createMany({
    data: [
      {
        email: 'admin@vipstc.edu.in',
        passwordHash: await bcrypt.hash('Vips@123', 10),
        role: 'ADMIN',
      },
      {
        email: 'aayushgambhir06@gmail.com',
        passwordHash: await bcrypt.hash('Fosil@231', 10),
        role: 'TEACHER',
      },
      {
        email: 'sample1@vipstc.edu.in',
        passwordHash: await bcrypt.hash('Sample@123', 10),
        role: 'TEACHER',
      },
      {
        email: 'sample2@vipstc.edu.in',
        passwordHash: await bcrypt.hash('Sample@123', 10),
        role: 'TEACHER',
      },
    ],
    skipDuplicates: true,
  });

  const userList = await prisma.user.findMany({ where: { role: 'TEACHER' } });

  // Create faculty profiles for teachers
  for (let i = 0; i < userList.length; i++) {
    const user = userList[i];
    const faculty = await prisma.faculty.create({
      data: {
        userId: user.id,
        empId: `T${100 + i}`,
        name: `Teacher ${i + 1}`,
        phone: `98765432${10 + i}`,
        rfidUid: `ABCDEF12345${i}`,
      },
    });

    // Assign to one section of each semester
    const assignedSections = await prisma.section.findMany({
      take: 3,
      skip: i * 3
    });

    for (const section of assignedSections) {
      const subs = await prisma.subject.findMany({ take: 3 });
      for (const sub of subs) {
        const instance = await prisma.subjectInstance.create({
          data: {
            facultyId: faculty.id,
            sectionId: section.id,
            subjectId: sub.id,
          },
        });

        // Create a device
        const device = await prisma.device.create({
       data: {
      macAddr: `00:11:22:33:44:${(Date.now() + i).toString(16).slice(-6)}`,
      secret: `secret${i}`,
      facultyId: faculty.id,
      lastBootAt: new Date(),
    },
  });
        // Attach session
        const session = await prisma.classSession.create({
          data: {
            subjectInstId: instance.id,
            teacherId: faculty.id,
            deviceId: device.id,
            startAt: new Date(Date.now() - 60 * 60 * 1000),
            isClosed: false,
          },
        });

        // One scan
        const students = await prisma.student.findMany({
          where: { sectionId: section.id },
          take: 1,
        });

        await prisma.attendanceLog.create({
          data: {
            studentId: students[0].id,
            sessionId: session.id,
            deviceId: device.id,
            status: 'PRESENT',
            timestamp: new Date(),
          },
        });
      }
    }
  }

  console.log(`✅ Seeding complete.`);
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
