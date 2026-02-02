import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        objectives: {
          include: {
            kpis: {
              include: {
                strategies: {
                  include: {
                    timeEntries: {
                      orderBy: {
                        period: "asc",
                      },
                    },
                  },
                  orderBy: {
                    orderIndex: "asc",
                  },
                },
              },
              orderBy: {
                orderIndex: "asc",
              },
            },
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        comments: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Check authorization
    if (
      session.user.role === "PROGRAM_HEAD" &&
      report.createdById !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error fetching report:", error)
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existingReport = await prisma.report.findUnique({
      where: { id },
    })

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Only creator can edit their own reports
    if (existingReport.createdById !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Cannot edit approved reports (view only)
    if (existingReport.status === "APPROVED") {
      return NextResponse.json(
        { error: "Approved reports are read-only and cannot be edited" },
        { status: 400 }
      )
    }

    const {
      programName,
      implementationPeriod,
      responsiblePerson,
      location,
      course,
      schoolYear,
      objectives,
    } = body

    // Delete existing nested data
    await prisma.objective.deleteMany({
      where: { reportId: id },
    })

    // Update report with new data
    const report = await prisma.report.update({
      where: { id },
      data: {
        programName,
        implementationPeriod,
        responsiblePerson,
        location,
        course,
        schoolYear,
        objectives: {
          create: objectives?.map((obj: any, objIndex: number) => ({
            title: obj.title,
            orderIndex: objIndex,
            kpis: {
              create: obj.kpis?.map((kpi: any, kpiIndex: number) => ({
                description: kpi.description,
                orderIndex: kpiIndex,
                strategies: {
                  create: kpi.strategies?.map((strategy: any, stratIndex: number) => ({
                    description: strategy.description,
                    target: strategy.target,
                    orderIndex: stratIndex,
                    timeEntries: {
                      create: strategy.timeEntries?.map((entry: any) => ({
                        period: entry.period,
                        periodStartMonth: entry.periodStartMonth,
                        periodEndMonth: entry.periodEndMonth,
                        activities: entry.activities || "",
                        status: entry.status || "",
                        statusComment: entry.statusComment || null,
                        budgetAllocated: entry.budgetAllocated || 0,
                        budgetSource: entry.budgetSource || "",
                        budgetSpent: entry.budgetSpent || 0,
                        variance: (entry.budgetAllocated || 0) - (entry.budgetSpent || 0),
                      })) || [],
                    },
                  })) || [],
                },
              })) || [],
            },
          })) || [],
        },
      },
      include: {
        objectives: {
          include: {
            kpis: {
              include: {
                strategies: {
                  include: {
                    timeEntries: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error updating report:", error)
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existingReport = await prisma.report.findUnique({
      where: { id },
    })

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Only creator can delete their own reports
    if (existingReport.createdById !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Cannot delete approved reports
    if (existingReport.status === "APPROVED") {
      return NextResponse.json(
        { error: "Approved reports cannot be deleted" },
        { status: 400 }
      )
    }

    await prisma.report.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting report:", error)
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    )
  }
}
