import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomBytes } from "crypto"

const UPLOAD_DIR = path.join(process.cwd(), "uploads")
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; kpiId: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: reportId, kpiId } = await params

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { objectives: { include: { kpis: true } } },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    const kpiBelongsToReport = report.objectives.some((o) =>
      o.kpis.some((k) => k.id === kpiId)
    )
    if (!kpiBelongsToReport) {
      return NextResponse.json({ error: "KPI not found" }, { status: 404 })
    }

    if (
      session.user.role === "PROGRAM_HEAD" &&
      report.createdById !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (report.status === "APPROVED") {
      return NextResponse.json(
        { error: "Cannot modify approved report" },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files.length) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      )
    }

    const uploadDir = path.join(UPLOAD_DIR, "reports", reportId, kpiId)
    await mkdir(uploadDir, { recursive: true })

    const created: { id: string; fileName: string }[] = []

    for (const file of files) {
      if (!file?.size) continue

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 10MB limit` },
          { status: 400 }
        )
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type not allowed: ${file.name}` },
          { status: 400 }
        )
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const uniqueName = `${randomBytes(8).toString("hex")}_${safeName}`
      const filePath = path.join(uploadDir, uniqueName)
      const relativePath = `reports/${reportId}/${kpiId}/${uniqueName}`

      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filePath, buffer)

      const attachment = await prisma.kpiAttachment.create({
        data: {
          kpiId,
          fileName: file.name,
          filePath: relativePath,
          mimeType: file.type,
          fileSize: file.size,
        },
      })

      created.push({ id: attachment.id, fileName: attachment.fileName })
    }

    return NextResponse.json({ created })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    )
  }
}
