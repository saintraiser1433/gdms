import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Role, UserStatus } from "@prisma/client"
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

    if (report.status === "APPROVED") {
      return NextResponse.json(
        { error: "Approved reports cannot be re-submitted." },
        { status: 400 }
      )
    }

    // Allow DRAFT, SUBMITTED (re-submit after edits), and DISAPPROVED (resubmit after changes)

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
      include: {
        createdBy: { select: { name: true } },
      },
    })

    // Create notifications for all admin users (non-blocking - submit succeeds even if this fails)
    try {
      if (prisma.notification) {
        const admins = await prisma.user.findMany({
          where: { role: Role.ADMIN, status: UserStatus.ACTIVE },
          select: { id: true },
        })
        const submitterName = updatedReport.createdBy?.name ?? "A program head"
        const reportTitle = updatedReport.programName || "Untitled report"
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            reportId: id,
            title: "New Report Submitted",
            message: `${submitterName} submitted "${reportTitle}" for review.`,
          })),
        })
      }
    } catch (notifErr) {
      console.warn("Could not create notifications (report submit succeeded):", notifErr)
    }

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error("Error submitting report:", error)
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    )
  }
}
