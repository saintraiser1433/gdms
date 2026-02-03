import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export interface ChartDataPoint {
  date: string
  created: number
  submitted: number
  approved: number
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "90d" // 7d | 30d | 90d

    const now = new Date()
    let daysBack = 90
    if (range === "30d") daysBack = 30
    else if (range === "7d") daysBack = 7

    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysBack)
    startDate.setHours(0, 0, 0, 0)

    const where: { createdById?: string; OR?: unknown[] } = {}

    if (session.user.role === "PROGRAM_HEAD") {
      where.createdById = session.user.id
    }

    const reports = await prisma.report.findMany({
      where,
      select: {
        createdAt: true,
        submittedAt: true,
        reviewedAt: true,
        status: true,
      },
    })

    const dataByDate = new Map<string, { created: number; submitted: number; approved: number }>()

    for (let d = 0; d <= daysBack; d++) {
      const dte = new Date(startDate)
      dte.setDate(dte.getDate() + d)
      const key = dte.toISOString().slice(0, 10)
      dataByDate.set(key, { created: 0, submitted: 0, approved: 0 })
    }

    for (const r of reports) {
      const createdKey = r.createdAt.toISOString().slice(0, 10)
      if (r.createdAt >= startDate && dataByDate.has(createdKey)) {
        const cur = dataByDate.get(createdKey)!
        cur.created += 1
      }

      if (r.submittedAt) {
        const subKey = r.submittedAt.toISOString().slice(0, 10)
        if (r.submittedAt >= startDate && dataByDate.has(subKey)) {
          const cur = dataByDate.get(subKey)!
          cur.submitted += 1
        }
      }

      if (r.status === "APPROVED" && r.reviewedAt) {
        const revKey = r.reviewedAt.toISOString().slice(0, 10)
        if (r.reviewedAt >= startDate && dataByDate.has(revKey)) {
          const cur = dataByDate.get(revKey)!
          cur.approved += 1
        }
      }
    }

    const chartData: ChartDataPoint[] = Array.from(dataByDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
