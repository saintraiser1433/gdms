import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gdms',
  password: 'postgres',
  port: 5432,
})

const adapter = new PrismaPg(pool)

// Invalidate cached client if it lacks newer models (e.g. after schema migration)
if (globalForPrisma.prisma && !(globalForPrisma.prisma as { notification?: unknown }).notification) {
  globalForPrisma.prisma = undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
