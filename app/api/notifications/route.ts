import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Role } from "@prisma/client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!prisma.notification) {
      return NextResponse.json([])
    }

    // Backfill: if admin, ensure notifications exist for all SUBMITTED reports
    if (session.user.role === Role.ADMIN) {
      try {
        const submittedReports = await prisma.report.findMany({
          where: { status: "SUBMITTED" },
          include: { createdBy: { select: { name: true } } },
        })
        for (const report of submittedReports) {
          const existing = await prisma.notification.findFirst({
            where: { userId: session.user.id, reportId: report.id },
          })
          if (!existing) {
            await prisma.notification.create({
              data: {
                userId: session.user.id,
                reportId: report.id,
                title: "New Report Submitted",
                message: `${report.createdBy?.name ?? "A program head"} submitted "${report.programName || "Untitled report"}" for review.`,
              },
            })
          }
        }
      } catch {
        // ignore backfill errors
      }
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(
      notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        reportId: n.reportId,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      }))
    )
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}
