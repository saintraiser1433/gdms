import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

function getCoursesClient() {
  if (!prisma?.course) {
    throw new Error("Prisma client not ready. Run 'npx prisma generate' and restart the dev server.")
  }
  return prisma.course
}

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Both ADMIN and PROGRAM_HEAD can list courses (for report creation)
    const courseClient = getCoursesClient()
    const courses = await courseClient.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Failed to fetch courses:", error)
    const message = error instanceof Error ? error.message : "Failed to fetch courses"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, abbreviation } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Course name is required" },
        { status: 400 }
      )
    }

    const trimmed = name.trim()
    if (!trimmed) {
      return NextResponse.json(
        { error: "Course name cannot be empty" },
        { status: 400 }
      )
    }

    const trimmedAbbrev = typeof abbreviation === "string" ? abbreviation.trim() : ""

    const courseClient = getCoursesClient()
    const existing = await courseClient.findUnique({
      where: { name: trimmed },
    })
    if (existing) {
      return NextResponse.json(
        { error: "A course with this name already exists" },
        { status: 409 }
      )
    }

    let course
    try {
      course = await courseClient.create({
        data: { name: trimmed, abbreviation: trimmedAbbrev },
      })
    } catch (createErr: unknown) {
      const msg = createErr instanceof Error ? createErr.message : String(createErr)
      if (msg.includes("Unknown argument") && msg.includes("abbreviation")) {
        // Fallback for stale Prisma client: create without abbreviation, then update
        course = await courseClient.create({ data: { name: trimmed } })
        if (trimmedAbbrev) {
          course = await courseClient.update({
            where: { id: course.id },
            data: { abbreviation: trimmedAbbrev },
          })
        }
      } else {
        throw createErr
      }
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Failed to create course:", error)
    const message = error instanceof Error ? error.message : "Failed to create course"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
