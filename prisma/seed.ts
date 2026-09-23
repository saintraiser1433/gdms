import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL, // use direct/session connection for seeding
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PERIOD_MONTHS: Record<string, { start: string; end: string }> = {
  T1: { start: 'January', end: 'April' },
  T2: { start: 'May', end: 'August' },
  T3: { start: 'September', end: 'December' },
  T4: { start: 'October', end: 'December' },
};

const REPORT_TEMPLATES = [
  { programName: 'Roots of Resilience: Mangrove Tree Planting Project', location: 'Alegado Beach, Brgy. Glan Padidu, Glan, Sarangani Province' },
  { programName: 'Community Health Outreach Program', location: 'Glan, Sarangani Province' },
  { programName: 'Literacy for All Initiative', location: 'Malapatan, Sarangani Province' },
  { programName: 'Sustainable Farming Education', location: 'Alabel, Sarangani Province' },
  { programName: 'Youth Leadership Development Program', location: 'Maasim, Sarangani Province' },
  { programName: 'Clean Water Access Project', location: 'Maitum, Sarangani Province' },
  { programName: 'Disaster Preparedness Training', location: 'Kiamba, Sarangani Province' },
  { programName: 'Women Empowerment Workshops', location: 'Malungon, Sarangani Province' },
  { programName: 'Digital Literacy for Farmers', location: 'Glan, Sarangani Province' },
  { programName: 'Nutrition and Food Security Program', location: 'Alabel, Sarangani Province' },
  { programName: 'Environmental Conservation Campaign', location: 'Maasim, Sarangani Province' },
  { programName: 'Skills Training for Out-of-School Youth', location: 'Malapatan, Sarangani Province' },
  { programName: 'Mental Health Awareness Initiative', location: 'Glan, Sarangani Province' },
  { programName: 'Renewable Energy Awareness Program', location: 'Kiamba, Sarangani Province' },
  { programName: 'Hygiene and Sanitation Project', location: 'Maitum, Sarangani Province' },
  { programName: 'Cultural Heritage Preservation', location: 'Malungon, Sarangani Province' },
  { programName: 'Livelihood Skills for Women', location: 'Alabel, Sarangani Province' },
  { programName: 'School Garden and Nutrition Program', location: 'Glan, Sarangani Province' },
  { programName: 'Community First Aid Training', location: 'Maasim, Sarangani Province' },
  { programName: 'Anti-Bullying and Peace Education', location: 'Malapatan, Sarangani Province' },
];

const OBJECTIVE_TEMPLATES = [
  'Enhance community participation in environmental conservation',
  'Improve health outcomes through education and outreach',
  'Increase literacy rates among community members',
  'Promote sustainable agricultural practices',
  'Develop youth leadership and civic engagement',
  'Ensure access to safe drinking water',
  'Build community resilience to natural disasters',
  'Empower women through skills and education',
  'Bridge the digital divide in rural communities',
  'Address malnutrition and food insecurity',
];

const KPI_TEMPLATES = [
  'Number of participants trained',
  'Percentage of target population reached',
  'Completeness of data collected during survey',
  'Number of seedlings planted and survival rate',
  'Level of community engagement and satisfaction',
];

const STRATEGY_TEMPLATES = [
  'Conduct comprehensive site surveys and assessments',
  'Organize regular community training sessions',
  'Partner with local government and NGOs',
  'Implement monitoring and evaluation framework',
  'Create awareness campaigns through social media',
];

const STATUSES: Array<'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'DISAPPROVED'> = [
  'APPROVED',
  'SUBMITTED',
  'DRAFT',
  'APPROVED',
];

const TIME_ENTRY_STATUSES = ['Completed', 'In Progress', 'Not Started', 'Delayed'];
const PERIOD_KEYS = ['T1', 'T2', 'T3', 'T4'] as const;

const COURSES = [
  { name: 'Bachelor of Science in Information Technology', abbreviation: 'BSIT' },
  { name: 'Bachelor of Science in Computer Science', abbreviation: 'BSCS' },
  { name: 'Bachelor of Science in Business Administration', abbreviation: 'BSBA' },
  { name: 'Bachelor of Secondary Education', abbreviation: 'BSED' },
  { name: 'Bachelor of Science in Accountancy', abbreviation: 'BSA' },
];

const PROGRAM_HEADS = [
  { email: 'dean@gdms.edu', name: 'Dr. Maria Santos', position: 'DEAN' as const, courseIdx: 0 },
  { email: 'phead.bsit@gdms.edu', name: 'Engr. Jose Ramirez', position: 'PROGRAM_HEAD' as const, courseIdx: 0 },
  { email: 'phead.bscs@gdms.edu', name: 'Prof. Anna Cruz', position: 'PROGRAM_HEAD' as const, courseIdx: 1 },
  { email: 'phead.bsba@gdms.edu', name: 'Dr. Ricardo Lim', position: 'PROGRAM_HEAD' as const, courseIdx: 2 },
  { email: 'instructor.bsed@gdms.edu', name: 'Ms. Grace Villanueva', position: 'INSTRUCTOR' as const, courseIdx: 3 },
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

async function main() {
  console.log('Starting seed...');

  // 1. Courses
  const courses = [];
  for (const c of COURSES) {
    const course = await prisma.course.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
    courses.push(course);
  }
  console.log(`Seeded ${courses.length} courses`);

  // 2. Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gdms.edu' },
    update: { passwordHash: adminPassword, status: 'ACTIVE' },
    create: {
      email: 'admin@gdms.edu',
      passwordHash: adminPassword,
      name: 'School Head',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('Seeded admin user:', admin.email);

  // 3. Program head / instructor users, each linked to a course
  const staffPassword = await bcrypt.hash('staff123', 10);
  const staffUsers = [];
  for (const p of PROGRAM_HEADS) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: { passwordHash: staffPassword, status: 'ACTIVE' },
      create: {
        email: p.email,
        passwordHash: staffPassword,
        name: p.name,
        role: 'PROGRAM_HEAD',
        position: p.position,
        status: 'ACTIVE',
        courseId: courses[p.courseIdx].id,
      },
    });
    staffUsers.push(user);
  }
  console.log(`Seeded ${staffUsers.length} staff users`);

  // 4. Reports with nested Objectives -> Kpis -> Strategies -> TimeEntries
  let reportCount = 0;
  for (let i = 0; i < REPORT_TEMPLATES.length; i++) {
    const tmpl = REPORT_TEMPLATES[i];
    const creator = pick(staffUsers, i);
    const course = courses[i % courses.length];
    const status = pick(STATUSES, i);
    const schoolYear = i % 2 === 0 ? '2024-2025' : '2025-2026';
    const periodKey = pick(PERIOD_KEYS, i);
    const period = PERIOD_MONTHS[periodKey];

    const report = await prisma.report.create({
      data: {
        programName: tmpl.programName,
        location: tmpl.location,
        implementationPeriod: `${period.start} - ${period.end}`,
        responsiblePerson: creator.name,
        course: course.abbreviation,
        schoolYear,
        status,
        createdById: creator.id,
        reviewedById: status === 'APPROVED' || status === 'DISAPPROVED' ? admin.id : null,
        submittedAt: status !== 'DRAFT' ? new Date() : null,
        reviewedAt: status === 'APPROVED' || status === 'DISAPPROVED' ? new Date() : null,
        objectives: {
          create: Array.from({ length: 2 }).map((_, oIdx) => {
            const objectiveGlobalIdx = i * 2 + oIdx;
            return {
              title: pick(OBJECTIVE_TEMPLATES, objectiveGlobalIdx),
              orderIndex: oIdx,
              kpis: {
                create: Array.from({ length: 2 }).map((_, kIdx) => {
                  const kpiGlobalIdx = objectiveGlobalIdx * 2 + kIdx;
                  return {
                    description: pick(KPI_TEMPLATES, kpiGlobalIdx),
                    orderIndex: kIdx,
                    strategies: {
                      create: Array.from({ length: 2 }).map((_, sIdx) => {
                        const strategyGlobalIdx = kpiGlobalIdx * 2 + sIdx;
                        return {
                          description: pick(STRATEGY_TEMPLATES, strategyGlobalIdx),
                          target: `${70 + (strategyGlobalIdx % 4) * 10}%`,
                          orderIndex: sIdx,
                          timeEntries: {
                            create: PERIOD_KEYS.map((pk, tIdx) => {
                              const pMonths = PERIOD_MONTHS[pk];
                              const budgetAllocated = 5000 + (strategyGlobalIdx % 5) * 1000;
                              const budgetSpent = tIdx <= i % 4 ? budgetAllocated * 0.8 : 0;
                              return {
                                period: pk,
                                periodStartMonth: pMonths.start,
                                periodEndMonth: pMonths.end,
                                activities: `Execute activities for ${pk} covering ${pMonths.start} to ${pMonths.end}`,
                                status: pick(TIME_ENTRY_STATUSES, tIdx + i),
                                budgetAllocated,
                                budgetSource: 'Institutional Fund',
                                budgetSpent,
                                variance: budgetAllocated - budgetSpent,
                              };
                            }),
                          },
                        };
                      }),
                    },
                  };
                }),
              },
            };
          }),
        },
        comments: {
          create: [
            {
              commentText: `Please ensure all supporting documents for "${tmpl.programName}" are attached before final review.`,
              pinnedToType: 'SECTION',
              createdById: admin.id,
            },
          ],
        },
      },
    });

    // Notification to the report creator
    await prisma.notification.create({
      data: {
        title: 'Report Update',
        message: `Your report "${report.programName}" is now ${report.status}.`,
        reportId: report.id,
        userId: creator.id,
        read: i % 3 === 0,
      },
    });

    reportCount++;
  }

  console.log(`Seeded ${reportCount} reports with objectives, KPIs, strategies, time entries, comments, and notifications`);
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });