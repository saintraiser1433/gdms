/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function flushDatabase() {
  try {
    console.log("🗑️  Starting database flush...")

    // Delete in order respecting foreign key constraints
    console.log("Deleting notifications...")
    await prisma.notification.deleteMany()

    console.log("Deleting KPI attachments...")
    await prisma.kpiAttachment.deleteMany()

    console.log("Deleting time entries...")
    await prisma.timeEntry.deleteMany()

    console.log("Deleting strategies...")
    await prisma.strategy.deleteMany()

    console.log("Deleting KPIs...")
    await prisma.kpi.deleteMany()

    console.log("Deleting objectives...")
    await prisma.objective.deleteMany()

    console.log("Deleting reports...")
    await prisma.report.deleteMany()

    console.log("Deleting courses...")
    await prisma.course.deleteMany()

    console.log("Deleting users...")
    await prisma.user.deleteMany()

    console.log("✅ Database flushed successfully!")
    console.log("All data has been deleted.")
  } catch (error) {
    console.error("❌ Error flushing database:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

flushDatabase()
  .then(() => {
    console.log("\n✨ Flush complete. You can now run 'npm run seed' to add fresh data.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Flush failed:", error)
    process.exit(1)
  })
