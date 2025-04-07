"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/dashboard/task-list"
import { TaskModal } from "@/components/dashboard/task-modal"

interface User {
  id: string
  name: string | null
}

interface Client {
  id: string
  name: string
}

interface Task {
  id: string
  title: string
  description: string | null
  status: "TODO" | "IN_PROGRESS" | "COMPLETED"
  priority: "LOW" | "MEDIUM" | "HIGH"
  dueDate: string | null
  createdAt: string
  client?: {
    id: string
    name: string
  } | null
  assignedTo?: {
    id: string
    name: string | null
  } | null
}

interface TasksPageClientProps {
  initialTasks: Task[]
  users: User[]
  clients: Client[]
  userRole: string
}

export function TasksPageClient({ initialTasks, users, clients, userRole }: TasksPageClientProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tasks, setTasks] = useState(initialTasks)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const todoTasks = tasks.filter((task) => task.status !== "COMPLETED")
  const completedTasks = tasks.filter((task) => task.status === "COMPLETED")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage and track tasks for your team and clients</p>
        </div>
        {userRole !== "CLIENT" && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <TaskList tasks={tasks} userRole={userRole} />
        </TabsContent>
        <TabsContent value="todo" className="mt-4">
          <TaskList tasks={todoTasks} userRole={userRole} />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <TaskList tasks={completedTasks} userRole={userRole} />
        </TabsContent>
      </Tabs>

      {/* Create Task Modal */}
      <TaskModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        users={users}
        clients={clients}
        mode="create"
      />
    </div>
  )
}

