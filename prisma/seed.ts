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
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
