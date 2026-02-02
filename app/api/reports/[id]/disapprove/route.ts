import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params

    const report = await prisma.report.findUnique({
      where: { id },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    if (report.status !== "SUBMITTED") {
      return NextResponse.json(
        { error: "Can only disapprove submitted reports" },
        { status: 400 }
      )
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status: "DISAPPROVED",
        reviewedById: session.user.id,
        reviewedAt: new Date(),
      },
    })

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error("Error disapproving report:", error)
    return NextResponse.json(
      { error: "Failed to disapprove report" },
      { status: 500 }
    )
  }
}
