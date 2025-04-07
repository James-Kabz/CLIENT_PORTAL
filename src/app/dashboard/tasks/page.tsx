import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth/auth-options"
import { db } from "@/lib/db"
import { TasksPageClient } from "./client"

export default async function TasksPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Fetch tasks
  const tasksData = await db.task.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(session.user.role === "CLIENT" ? { clientId: session.user.id } : {}),
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Convert Date objects to strings to fix type issues
  const tasks = tasksData.map((task) => ({
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
  }))

  // Fetch users and clients for the task form
  const [users, clients] = await Promise.all([
    db.user.findMany({
      where: {
        organizationId: session.user.organizationId,
        role: {
          in: ["ADMIN", "MANAGER", "STAFF"],
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    session.user.role !== "CLIENT"
      ? db.client.findMany({
          where: {
            organizationId: session.user.organizationId,
          },
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: "asc",
          },
        })
      : [],
  ])

  return <TasksPageClient initialTasks={tasks} users={users} clients={clients} userRole={session.user.role} />
}

