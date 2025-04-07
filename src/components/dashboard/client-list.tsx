"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash, User } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ClientModal } from "./client-modal"

interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  createdAt: string | Date
}

interface ClientListProps {
  clients: Client[]
}

export function ClientList({ clients }: ClientListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null)

  const openDeleteDialog = (id: string) => {
    setClientToDelete(id)
    setDeleteDialogOpen(true)
  }

  const openEditModal = (client: Client) => {
    setClientToEdit(client)
    setEditModalOpen(true)
  }

  const handleDelete = async () => {
    if (!clientToDelete) return

    setIsDeleting(clientToDelete)

    try {
      const response = await fetch(`/api/clients/${clientToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete client")
      }

      toast.success("Client deleted", {
        description: "The client has been deleted successfully",
      })

      // In a real app, you would update the UI here
      // For now, we'll just reload the page
      window.location.reload()
    } catch (error) {
      console.error(error)
      toast.error("Delete failed", {
        description: "There was an error deleting the client",
      })
    } finally {
      setIsDeleting(null)
      setDeleteDialogOpen(false)
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
    <>
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
                    <DropdownMenuItem onClick={() => openEditModal(client)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(client.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
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
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
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

      {/* Edit Client Modal */}
      {clientToEdit && (
        <ClientModal open={editModalOpen} onOpenChange={setEditModalOpen} client={clientToEdit} mode="edit" />
      )}
    </>
  )
}

