"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Client {
  id?: string
  name: string
  email: string
  phone?: string | null
  address?: string | null
  notes?: string
}

interface ClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client
  mode: "create" | "edit"
}

export function ClientModal({ open, onOpenChange, client, mode }: ClientModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState(client?.name || "")
  const [email, setEmail] = useState(client?.email || "")
  const [phone, setPhone] = useState(client?.phone || "")
  const [address, setAddress] = useState(client?.address || "")
  const [notes, setNotes] = useState(client?.notes || "")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data = {
      name,
      email,
      phone,
      address,
      notes,
    }

    try {
      const url = mode === "create" ? "/api/clients" : `/api/clients/${client?.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${mode} client`)
      }

      toast.success(`Client ${mode === "create" ? "created" : "updated"}`, {
        description: `The client has been ${mode === "create" ? "created" : "updated"} successfully`,
      })

      router.refresh()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error(error)
      toast.error(`${mode === "create" ? "Creation" : "Update"} failed`, {
        description: `There was an error ${mode === "create" ? "creating" : "updating"} the client`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setName("")
    setEmail("")
    setPhone("")
    setAddress("")
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add" : "Edit"} Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Client Name</Label>
            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address (Optional)</Label>
            <Textarea id="address" name="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
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
                  ? "Create Client"
                  : "Update Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

