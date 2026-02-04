import { Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * GET /api/reports/catalog
 * Returns approved reports for Report Catalogs:
 * - Admin: all approved reports
 * - Program Head: approved reports belonging to their course only
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const where: Prisma.ReportWhereInput = { status: "APPROVED" }

    if (session.user.role === "PROGRAM_HEAD") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { course: { select: { name: true } } },
      })
      const courseName = user?.course?.name
      if (!courseName) {
        return NextResponse.json([])
      }
      where.course = courseName
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
          },
        },
      },
      orderBy: { reviewedAt: "desc" },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error fetching report catalog:", error)
    return NextResponse.json(
      { error: "Failed to fetch report catalog" },
      { status: 500 }
    )
  }
}
