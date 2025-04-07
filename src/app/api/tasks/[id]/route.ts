import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { db } from "@/lib/db"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { pathname } = new URL(request.url);
    const taskId = pathname.split("/").pop();
    if (!taskId) return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    const data = await request.json()

    // Verify the task exists and belongs to the user's organization
    const existingTask = await db.task.findFirst({
      where: {
        id: taskId,
        organizationId: session.user.organizationId,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    // Update the task
    const updatedTask = await db.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...data,
        // Ensure these fields can't be modified directly
        organizationId: undefined,
        createdById: undefined,
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Only admin and manager can delete tasks
    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const taskId = params.id

    // Verify the task exists and belongs to the user's organization
    const existingTask = await db.task.findFirst({
      where: {
        id: taskId,
        organizationId: session.user.organizationId,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    // Delete the task
    await db.task.delete({
      where: {
        id: taskId,
      },
    })

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

