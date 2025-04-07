"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { CheckCircle2, Circle, Clock, MoreHorizontal, MessageSquare, Trash, Edit } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface Task {
  id: string
  title: string
  description: string | null
  status: "TODO" | "IN_PROGRESS" | "COMPLETED"
  priority: "LOW" | "MEDIUM" | "HIGH"
  dueDate: string | null
  createdAt: string | Date // Accept both string and Date
  client?: {
    id: string
    name: string
  } | null
  assignedTo?: {
    id: string
    name: string | null
  } | null
}

interface TaskListProps {
  tasks: Task[]
  userRole: string
}

export function TaskList({ tasks, userRole }: TaskListProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  const handleStatusChange = async (id: string, status: Task["status"]) => {
    setIsUpdating(id)

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task status")
      }

      toast.success("Task updated", {
        description: "The task status has been updated successfully",
      })

      // In a real app, you would update the UI here
      // For now, we'll just reload the page
      window.location.reload()
    } catch (error) {
      console.error(error)
      toast.error("Update failed", {
        description: "There was an error updating the task status",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const openDeleteDialog = (id: string) => {
    setTaskToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!taskToDelete) return

    setIsDeleting(taskToDelete)

    try {
      const response = await fetch(`/api/tasks/${taskToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      toast.success("Task deleted", {
        description: "The task has been deleted successfully",
      })

      // In a real app, you would update the UI here
      // For now, we'll just reload the page
      window.location.reload()
    } catch (error) {
      console.error(error)
      toast.error("Delete failed", {
        description: "There was an error deleting the task",
      })
    } finally {
      setIsDeleting(null)
      setDeleteDialogOpen(false)
    }
  }

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "LOW":
        return <Badge variant="outline">Low</Badge>
      case "MEDIUM":
        return <Badge>Medium</Badge>
      case "HIGH":
        return <Badge variant="destructive">High</Badge>
      default:
        return null
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">No tasks found</h3>
        <p className="text-sm text-gray-500 mt-2">Create your first task to get started.</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            {userRole !== "CLIENT" && <TableHead>Client</TableHead>}
            <TableHead>Assigned To</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleStatusChange(task.id, task.status === "COMPLETED" ? "TODO" : "COMPLETED")}
                  disabled={isUpdating === task.id}
                >
                  {task.status === "COMPLETED" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="sr-only">Toggle status</span>
                </Button>
              </TableCell>
              <TableCell>
                <div className="font-medium">{task.title}</div>
                {task.description && <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>}
              </TableCell>
              <TableCell>{getPriorityBadge(task.priority)}</TableCell>
              <TableCell>
                {task.dueDate ? (
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
                    <span>{formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
                  </div>
                ) : (
                  "—"
                )}
              </TableCell>
              {userRole !== "CLIENT" && <TableCell>{task.client ? task.client.name : "—"}</TableCell>}
              <TableCell>{task.assignedTo ? task.assignedTo.name : "Unassigned"}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Add Comment</span>
                    </DropdownMenuItem>
                    {userRole !== "CLIENT" && (
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit Task</span>
                      </DropdownMenuItem>
                    )}
                    {(userRole === "ADMIN" || userRole === "MANAGER") && (
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(task.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting !== null}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

