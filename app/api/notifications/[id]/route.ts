import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    if (!prisma.notification) {
      return NextResponse.json({ error: "Notifications not available" }, { status: 503 })
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to mark notification as read:", error)
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    )
  }
}
