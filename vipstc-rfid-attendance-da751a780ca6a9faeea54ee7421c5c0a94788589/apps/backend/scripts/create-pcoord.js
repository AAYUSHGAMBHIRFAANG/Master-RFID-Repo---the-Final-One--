import { prisma } from '../src/services/prisma.js';
import bcrypt from 'bcrypt';

// --- Define the demo Program Coordinator details here ---
const name = 'Demo Coordinator';
const email = 'pcoord@vipstc.edu.in';
const password = 'password123';
const employeeId = 'PCOORD001';
const phone = '9999999999'; // ✅ Added the required phone number
const rfidUid = '1234567890'; // Example RFID UID, can be any unique identifier
// ---------------------------------------------------------

async function main() {
  console.log(`Checking for existing user: ${email}`);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`User with email ${email} already exists.`);
    return;
  }

  console.log(`Creating new Program Coordinator: ${name} (${email})`);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: 'PCOORD',
      facultyProfile: {
        create: {
          name: name,
          empId: employeeId,
          phone: phone, // ✅ Included phone in the creation step
          rfidUid: rfidUid, // ✅ Included RFID UID in the creation step
        },
      },
    },
    include: {
        facultyProfile: true,
    }
  });

  console.log('✅ Program Coordinator created successfully:');
  console.log({
    id: user.id,
    email: user.email,
    role: user.role,
    faculty: user.facultyProfile,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error creating Program Coordinator:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });