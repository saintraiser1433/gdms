import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const course = searchParams.get("course")
    const schoolYear = searchParams.get("schoolYear")

    const where: any = {}

    // Program heads can only see their own reports
    if (session.user.role === "PROGRAM_HEAD") {
      where.createdById = session.user.id
    }

    // Admin does not see draft reports (only submitted, approved, disapproved)
    if (status) {
      if (session.user.role === "ADMIN" && status === "DRAFT") {
        where.id = "00000000-0000-0000-0000-000000000000" // Return empty for admin
      } else {
        where.status = status
      }
    } else if (session.user.role === "ADMIN") {
      where.status = { not: "DRAFT" }
    }
    if (course) {
      where.course = course
    }
    if (schoolYear) {
      where.schoolYear = schoolYear
    }

    const reports = await prisma.report.findMany({
      where,
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
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "PROGRAM_HEAD") {
      return NextResponse.json({ error: "Only program heads can create reports" }, { status: 403 })
    }

    const body = await request.json()
    const {
      programName,
      implementationPeriod,
      responsiblePerson,
      location,
      course,
      schoolYear,
      objectives,
    } = body

    // Validate: budget spent must not exceed budget allocated
    const hasBudgetViolation = (objectives ?? []).some((obj: any) =>
      (obj.kpis ?? []).some((kpi: any) =>
        (kpi.strategies ?? []).some((strat: any) =>
          (strat.timeEntries ?? []).some(
            (entry: any) => (entry.budgetSpent ?? 0) > (entry.budgetAllocated ?? 0)
          )
        )
      )
    )
    if (hasBudgetViolation) {
      return NextResponse.json(
        { error: "Budget spent cannot be greater than budget allocated for any entry." },
        { status: 400 }
      )
    }

    // Create report with nested objectives, KPIs, strategies, and time entries
    const report = await prisma.report.create({
      data: {
        programName: programName || "",
        implementationPeriod: implementationPeriod ?? "",
        responsiblePerson: responsiblePerson || "",
        location: location || "",
        course: course || "",
        schoolYear: schoolYear || "",
        status: "DRAFT",
        createdBy: { connect: { id: session.user.id } },
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

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    )
  }
}
