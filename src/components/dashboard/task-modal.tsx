"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface User {
  id: string
  name: string | null
}

interface Client {
  id: string
  name: string
}

interface Task {
  id?: string
  title: string
  description?: string | null
  priority: "LOW" | "MEDIUM" | "HIGH"
  assignedToId?: string
  clientId?: string
dueDate?: Date | null| string
}

interface TaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  users: User[]
  clients: Client[]
  mode: "create" | "edit"
}

export function TaskModal({ open, onOpenChange, task, users, clients, mode }: TaskModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate ? new Date(task.dueDate) : undefined)
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [priority, setPriority] = useState(task?.priority || "MEDIUM")
  const [assignedToId, setAssignedToId] = useState(task?.assignedToId || "")
  const [clientId, setClientId] = useState(task?.clientId || "")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data = {
      title,
      description,
      priority,
      assignedToId: assignedToId || undefined,
      clientId: clientId || undefined,
      dueDate: dueDate ? dueDate.toISOString() : null,
    }

    try {
      const url = mode === "create" ? "/api/tasks" : `/api/tasks/${task?.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${mode} task`)
      }

      toast.success(`Task ${mode === "create" ? "created" : "updated"}`, {
        description: `Your task has been ${mode === "create" ? "created" : "updated"} successfully`,
      })

      router.refresh()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error(error)
      toast.error(`Task ${mode === "create" ? "creation" : "update"} failed`, {
        description: `There was an error ${mode === "create" ? "creating" : "updating"} your task`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setPriority("MEDIUM")
    setAssignedToId("")
    setClientId("")
    setDueDate(undefined)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create" : "Edit"} Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select name="priority" value={priority} onValueChange={(value) => setPriority(value as "LOW" | "MEDIUM" | "HIGH")}>

              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedToId">Assign To</Label>
            <Select name="assignedToId" value={assignedToId} onValueChange={setAssignedToId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientId">Client (Optional)</Label>
            <Select name="clientId" value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? `${mode === "create" ? "Creating" : "Updating"}...`
                : mode === "create"
                  ? "Create Task"
                  : "Update Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

