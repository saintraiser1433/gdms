import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      where: { role: "PROGRAM_HEAD" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        position: true,
        status: true,
        courseId: true,
        course: { select: { id: true, name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Failed to fetch users:", error)
    const msg = error instanceof Error ? error.message : "Unknown error"
    const isDbError = msg.includes("connect") || msg.includes("ECONNREFUSED") || msg.includes("prisma")
    return NextResponse.json(
      { error: isDbError ? "Database connection failed. Check that PostgreSQL is running." : "Failed to fetch users" },
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
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, password, courseId, status, position } = body

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }
    if (!courseId || typeof courseId !== "string") {
      return NextResponse.json(
        { error: "Course is required. Add courses first in the Courses module." },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()
    const userStatus = status === "INACTIVE" ? "INACTIVE" : "ACTIVE"

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })
    if (!course) {
      return NextResponse.json(
        { error: "Selected course does not exist. Please choose a course from the list." },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    })
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const validPosition = ["DEAN", "PROGRAM_HEAD", "INSTRUCTOR"].includes(position) ? position : "PROGRAM_HEAD"

    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        name: trimmedName,
        passwordHash,
        role: "PROGRAM_HEAD",
        position: validPosition,
        status: userStatus,
        courseId: course.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        position: true,
        status: true,
        courseId: true,
        course: { select: { id: true, name: true } },
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Failed to create user:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}
