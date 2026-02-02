import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gdms',
  password: 'postgres',
  port: 5432,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gdms.edu' },
    update: {},
    create: {
      email: 'admin@gdms.edu',
      passwordHash: adminPassword,
      name: 'School Head',
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create program head users
  const programHeadPassword = await bcrypt.hash('program123', 10);
  
  const programHead1 = await prisma.user.upsert({
    where: { email: 'nursing@gdms.edu' },
    update: {},
    create: {
      email: 'nursing@gdms.edu',
      passwordHash: programHeadPassword,
      name: 'Nursing Program Head',
      role: 'PROGRAM_HEAD',
    },
  });

  console.log('Created program head user:', programHead1.email);

  const programHead2 = await prisma.user.upsert({
    where: { email: 'engineering@gdms.edu' },
    update: {},
    create: {
      email: 'engineering@gdms.edu',
      passwordHash: programHeadPassword,
      name: 'Engineering Program Head',
      role: 'PROGRAM_HEAD',
    },
  });

  console.log('Created program head user:', programHead2.email);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
