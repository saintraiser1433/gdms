import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "uploads")

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

    const attachment = await prisma.kpiAttachment.findUnique({
      where: { id },
      include: {
        kpi: {
          include: {
            objective: { include: { report: true } },
          },
        },
      },
    })

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 })
    }

    const report = attachment.kpi.objective.report
    if (
      session.user.role === "PROGRAM_HEAD" &&
      report.createdById !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const fullPath = path.join(UPLOAD_DIR, attachment.filePath)
    const buffer = await readFile(fullPath)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Disposition": `inline; filename="${attachment.fileName}"`,
      },
    })
  } catch (error) {
    console.error("Attachment fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch attachment" },
      { status: 500 }
    )
  }
}
