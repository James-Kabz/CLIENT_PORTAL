"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Client {
  id?: string
  name: string
  email: string
  phone?: string | null
  address?: string | null
  notes?: string | null 
}

interface ClientFormProps {
  client?: Client
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!client?.id

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      notes: formData.get("notes") as string,
    }

    try {
      const url = isEditing ? `/api/clients/${client.id}` : "/api/clients"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? "update" : "create"} client`)
      }

      toast.success(`Client ${isEditing ? "updated" : "created"}`,{
        description: `The client has been ${isEditing ? "updated" : "created"} successfully`,
      })

      router.push("/dashboard/clients")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(`${isEditing ? "Update" : "Creation"} failed`,{
        description: error instanceof Error ? error.message : `There was an error ${isEditing ? "updating" : "creating"} the client`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Client Name</Label>
        <Input id="name" name="name" defaultValue={client?.name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={client?.email} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input id="phone" name="phone" defaultValue={client?.phone || ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address (Optional)</Label>
        <Textarea id="address" name="address" defaultValue={client?.address || ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea id="notes" name="notes" defaultValue={client?.notes || ""} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Client" : "Create Client"}
      </Button>
    </form>
  )
}

