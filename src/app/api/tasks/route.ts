import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title, description, priority, assignedToId, clientId, dueDate } = await req.json()

    const task = await db.task.create({
      data: {
        title,
        description,
        priority,
        dueDate,
        organizationId: session.user.organizationId,
        createdById: session.user.id,
        ...(assignedToId ? { assignedToId } : {}),
        ...(clientId ? { clientId } : {}),
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

