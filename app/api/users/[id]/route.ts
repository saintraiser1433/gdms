import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function PATCH(
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
    const { name, email, password, courseId, status } = body

    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (existingUser.role !== "PROGRAM_HEAD") {
      return NextResponse.json({ error: "Can only edit program head users" }, { status: 403 })
    }

    const updates: {
      name?: string
      email?: string
      passwordHash?: string
      courseId?: string | null
      status?: "ACTIVE" | "INACTIVE"
    } = {}

    if (name !== undefined && typeof name === "string") {
      updates.name = name.trim()
    }

    if (email !== undefined && typeof email === "string") {
      const trimmedEmail = email.trim().toLowerCase()
      const duplicate = await prisma.user.findFirst({
        where: {
          email: trimmedEmail,
          NOT: { id },
        },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 }
        )
      }
      updates.email = trimmedEmail
    }

    if (password !== undefined && typeof password === "string" && password.length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        )
      }
      updates.passwordHash = await bcrypt.hash(password, 10)
    }

    if (courseId !== undefined) {
      if (courseId === null || courseId === "") {
        updates.courseId = null
      } else if (typeof courseId === "string") {
        const course = await prisma.course.findUnique({
          where: { id: courseId },
        })
        if (!course) {
          return NextResponse.json(
            { error: "Selected course does not exist" },
            { status: 400 }
          )
        }
        const existingProgramHeadForCourse = await prisma.user.findFirst({
          where: {
            role: "PROGRAM_HEAD",
            courseId: course.id,
            NOT: { id },
          },
        })
        if (existingProgramHeadForCourse) {
          return NextResponse.json(
            { error: "This course already has a program head assigned. Only one program head per course is allowed." },
            { status: 409 }
          )
        }
        updates.courseId = course.id
      }
    }

    if (status !== undefined && (status === "ACTIVE" || status === "INACTIVE")) {
      updates.status = status
    }

    const user = await prisma.user.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        courseId: true,
        course: { select: { id: true, name: true } },
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Failed to update user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}
