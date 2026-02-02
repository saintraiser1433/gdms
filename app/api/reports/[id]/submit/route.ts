import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
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
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    if (report.createdById !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (report.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Can only submit draft reports" },
        { status: 400 }
      )
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    })

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error("Error submitting report:", error)
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    )
  }
}
