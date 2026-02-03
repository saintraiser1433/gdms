import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const course = await prisma.course.findUnique({
      where: { id },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Failed to fetch course:", error)
    return NextResponse.json(
      { error: "Failed to fetch course" },
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
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
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

    const existing = await prisma.course.findFirst({
      where: {
        name: trimmed,
        NOT: { id },
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: "A course with this name already exists" },
        { status: 409 }
      )
    }

    const course = await prisma.course.update({
      where: { id },
      data: { name: trimmed, abbreviation: trimmedAbbrev },
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("Failed to update course:", error)
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    await prisma.course.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete course:", error)
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    )
  }
}
