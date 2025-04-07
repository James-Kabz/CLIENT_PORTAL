"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash, User } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  createdAt: Date
}

interface ClientListProps {
  clients: Client[]
}

export function ClientList({ clients }: ClientListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      setIsDeleting(id)

      try {
        const response = await fetch(`/api/clients/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete client")
        }

        toast.success("Client deleted",{
          description: "The client has been deleted successfully",
        })

        // In a real app, you would update the UI here
        // For now, we'll just reload the page
        window.location.reload()
      } catch (error) {
        console.error(error)
        toast.error("Delete failed",{
          description: error instanceof Error ? error.message : "There was an error deleting the client",
        })
      } finally {
        setIsDeleting(null)
      }
    }
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <User className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">No clients found</h3>
        <p className="text-sm text-gray-500 mt-2">Add your first client to get started.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Address</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell>{client.email}</TableCell>
            <TableCell>{client.phone || "—"}</TableCell>
            <TableCell>{client.address || "—"}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/clients/${client.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(client.id)}
                    disabled={isDeleting === client.id}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <span>{isDeleting === client.id ? "Deleting..." : "Delete"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

