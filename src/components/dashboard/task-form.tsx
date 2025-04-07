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

interface User {
  id: string
  name: string
}

interface Client {
  id: string
  name: string
}

interface TaskFormProps {
  users: User[]
  clients: Client[]
}

export function TaskForm({ users, clients }: TaskFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      priority: formData.get("priority") as string,
      assignedToId: formData.get("assignedToId") as string,
      clientId: formData.get("clientId") as string,
      dueDate: dueDate ? dueDate.toISOString() : null,
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create task")
      }

      toast.success("Task created",{
        description: "Your task has been created successfully",
      })

      router.refresh()
      ;(e.target as HTMLFormElement).reset()
      setDueDate(undefined)
    } catch (error) {
      console.error(error)
      toast.error("Task creation failed",{        
        description: error instanceof Error ? error.message :"There was an error creating your task",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input id="title" name="title" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select name="priority" defaultValue="MEDIUM">
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
        <Select name="assignedToId">
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
        <Select name="clientId">
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

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Task"}
      </Button>
    </form>
  )
}

