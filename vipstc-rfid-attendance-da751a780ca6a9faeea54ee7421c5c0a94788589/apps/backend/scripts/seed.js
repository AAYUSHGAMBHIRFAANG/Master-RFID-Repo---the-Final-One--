/**
 * Seed script for VIPS‑TC demo data.
 * Run:  npx prisma db seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const SALT = 10;

async function main() {
  /* 1. Departments */
  const vsit = await prisma.department.upsert({
  data: {
    code: "VSIT",
    name: "Vivekananda School of Information Technology"
  }
});

const vset = await prisma.department.upsert({
  data: {
    code: "VSET",
    name: "Vivekananda School of Engineering & Technology"
  }
});

  /* 2. Courses (with durationYears) */
  const courses = await prisma.course.createMany({
    data: [
      { name: "Bachelor of Computer Applications", departmentId: 1, durationYears: 3, degreeType: "UG" }, // id 1
      { name: "B.Tech Computer Science & Engineering", departmentId: 2, durationYears: 4, degreeType: "UG" }, // id 2
      { name: "Master of Computer Applications", departmentId: 1, durationYears: 2, degreeType: "PG" } // id 3
    ],
    skipDuplicates: true
  });

  /* 3. Semesters & Sections */
  for (let courseId = 1; courseId <= 3; courseId++) {
    const years = courseId === 2 ? 4 : courseId === 3 ? 2 : 3; // durations
    for (let sem = 1; sem <= years * 2; sem++) {
      const semester = await prisma.semester.create({
        data: {
          number: sem,
          type: sem % 2 ? "odd" : "even",
          courseId
        }
      });
      // Two sections A & B
      for (const sName of ["A", "B"]) {
        await prisma.section.create({
          data: { name: sName, semesterId: semester.id }
        });
      }
    }
  }

  /* 4. Subjects (3 Theory + 3 Lab) */
  const subjects = await prisma.subject.createMany({
    data: [
      { code: "BCA101T", name: "Programming Fundamentals", credits: 4, type: "T" },
      { code: "BCA101P", name: "Programming Lab", credits: 1, type: "P" },
      { code: "CSE202T", name: "Data Structures", credits: 4, type: "T" },
      { code: "CSE202P", name: "Data Structures Lab", credits: 1, type: "P" },
      { code: "MCA301T", name: "Software Engineering", credits: 3, type: "T" },
      { code: "MCA301P", name: "Software Engineering Lab", credits: 1, type: "P" }
    ],
    skipDuplicates: true
  });

  /* 5. Users & Faculty */
  const teachersSeed = [
    {
      name: "Anita Sharma",
      email: "anita.sharma@vips.edu.in",
      empId: "VSIT‑T001",
      phone: "9876543210",
      departmentId: 1,
      password: "password123"
    },
    {
      name: "Rahul Verma",
      email: "rahul.verma@vips.edu.in",
      empId: "VSET‑T002",
      phone: "9876543211",
      departmentId: 2,
      password: "password123"
    },
    {
      name: "Kavita Mehra",
      email: "kavita.mehra@vips.edu.in",
      empId: "VSIT‑T003",
      phone: "9876543212",
      departmentId: 1,
      password: "password123"
    }
  ];

  for (const t of teachersSeed) {
    const pwHash = await bcrypt.hash(t.password, SALT);
    const user = await prisma.user.create({
      data: {
        email: t.email,
        passwordHash: pwHash,
        role: "TEACHER"
      }
    });
    await prisma.faculty.create({
      data: {
        userId: user.id,
        empId: t.empId,
        name: t.name,
        phone: t.phone,
        rfidUid: (Math.random().toString(16).slice(2) + "000000000000").slice(0, 12) // dummy 12‑hex
      }
    });
  }

  /* 6. Subject Instances – map each teacher to a section */
  // Anita -> BCA 2A Programming
  await prisma.subjectInstance.create({
    data: {
      subjectId: 1, // BCA101T
      sectionId: 3, // BCA semester 2 section A
      facultyId: 1
    }
  });
  // Rahul -> CSE 4B Data Structures
  await prisma.subjectInstance.create({
    data: {
      subjectId: 3, // CSE202T
      sectionId: 14, // CSE semester 4 section B
      facultyId: 2
    }
  });
  // Kavita -> MCA 1A Software Engg
  await prisma.subjectInstance.create({
    data: {
      subjectId: 5, // MCA301T
      sectionId: 19, // MCA semester 1 section A
      facultyId: 3
    }
  });

  /* 7. Demo Students (10 per section) */
  const demoSections = [3, 14, 19]; // sectionIds above
  let enrolSeq = 1;

  for (const sId of demoSections) {
    for (let i = 1; i <= 10; i++) {
      const enrol = `DEMO${String(enrolSeq).padStart(3, "0")}`;
      enrolSeq++;
      await prisma.student.create({
        data: {
          name: `Student ${enrol}`,
          enrollmentNo: enrol,
          rfidUid: (Math.random().toString(16).slice(2) + "000000000000").slice(0, 12),
          sectionId: sId
        }
      });
    }
  }

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
