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

const STATUSES = ['Completed', 'In Progress', 'Not Started', 'Completed'];

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

  // Create courses
  const nursingCourse = await prisma.course.upsert({
    where: { name: 'Nursing' },
    update: {},
    create: { name: 'Nursing', abbreviation: 'BSN' },
  });
  const engineeringCourse = await prisma.course.upsert({
    where: { name: 'Engineering' },
    update: {},
    create: { name: 'Engineering', abbreviation: 'BSE' },
  });
  console.log('Created courses');

  // Create program head users with courses
  const programHeadPassword = await bcrypt.hash('program123', 10);
  const programHead1 = await prisma.user.upsert({
    where: { email: 'nursing@gdms.edu' },
    update: { courseId: nursingCourse.id },
    create: {
      email: 'nursing@gdms.edu',
      passwordHash: programHeadPassword,
      name: 'Nursing Program Head',
      role: 'PROGRAM_HEAD',
      courseId: nursingCourse.id,
    },
  });
  const programHead2 = await prisma.user.upsert({
    where: { email: 'engineering@gdms.edu' },
    update: { courseId: engineeringCourse.id },
    create: {
      email: 'engineering@gdms.edu',
      passwordHash: programHeadPassword,
      name: 'Engineering Program Head',
      role: 'PROGRAM_HEAD',
      courseId: engineeringCourse.id,
    },
  });
  console.log('Created program head users');

  // Create 20 approved reports
  const programHeads = [programHead1, programHead2];
  const courses = ['Nursing', 'Engineering'];
  const schoolYears = ['2023-2024', '2024-2025', '2025-2026'];
  const implementationPeriods = ['2023', '2024', '2025'];

  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setMonth(pastDate.getMonth() - 2);

  const courseAbbrevs: Record<string, string> = {
    Nursing: nursingCourse.abbreviation || 'BSN',
    Engineering: engineeringCourse.abbreviation || 'BSE',
  };

  for (let i = 0; i < 20; i++) {
    const creator = programHeads[i % 2];
    const course = courses[i % 2];
    const abbrev = courseAbbrevs[course] || course;
    const template = REPORT_TEMPLATES[i];
    const schoolYear = schoolYears[i % 3];
    const implPeriod = implementationPeriods[i % 3];

    const report = await prisma.report.create({
      data: {
        programName: template.programName,
        implementationPeriod: implPeriod,
        responsiblePerson: `${creator.name} / ${abbrev}`,
        location: template.location,
        course,
        schoolYear,
        status: 'APPROVED',
        createdById: creator.id,
        reviewedById: admin.id,
        submittedAt: pastDate,
        reviewedAt: pastDate,
      },
    });

    // Create 2-4 objectives per report
    const numObjectives = 2 + (i % 3);
    for (let o = 0; o < numObjectives; o++) {
      const objective = await prisma.objective.create({
        data: {
          reportId: report.id,
          title: OBJECTIVE_TEMPLATES[(i + o) % OBJECTIVE_TEMPLATES.length],
          orderIndex: o,
        },
      });

      // Create 1-2 KPIs per objective
      const numKpis = 1 + (o % 2);
      for (let k = 0; k < numKpis; k++) {
        const kpi = await prisma.kpi.create({
          data: {
            objectiveId: objective.id,
            description: KPI_TEMPLATES[(i + o + k) % KPI_TEMPLATES.length],
            orderIndex: k,
          },
        });

        // Create 1-2 strategies per KPI
        const numStrategies = 1 + (k % 2);
        for (let s = 0; s < numStrategies; s++) {
          const strategy = await prisma.strategy.create({
            data: {
              kpiId: kpi.id,
              description: `S${s + 1}. ${STRATEGY_TEMPLATES[(i + o + k + s) % STRATEGY_TEMPLATES.length]}`,
              target: `${50 + (i + o + k + s) * 10}% completion rate`,
              orderIndex: s,
            },
          });

          // Create 4 time entries (T1, T2, T3, T4) per strategy
          const periods = ['T1', 'T2', 'T3', 'T4'] as const;
          for (let p = 0; p < 4; p++) {
            const period = periods[p];
            const months = PERIOD_MONTHS[period];
            const budgetAlloc = 5000 + (i + o + k + s + p) * 1000;
            const budgetSpent = Math.floor(budgetAlloc * (0.6 + (p * 0.1)));
            await prisma.timeEntry.create({
              data: {
                strategyId: strategy.id,
                period,
                periodStartMonth: months.start,
                periodEndMonth: months.end,
                activities: `Activities completed for ${period} (${months.start}-${months.end})`,
                status: STATUSES[p % STATUSES.length],
                budgetAllocated: budgetAlloc,
                budgetSource: 'School budget',
                budgetSpent,
                variance: budgetAlloc - budgetSpent,
              },
            });
          }
        }
      }
    }
  }

  console.log('Created 20 approved reports with objectives, KPIs, strategies, and 4 timeline entries each');
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
