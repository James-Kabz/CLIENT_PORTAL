"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, MoreHorizontal, Download, Trash, Pencil } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useMediaQuery } from "@/hooks/use-media-query"
import { DocumentModal } from "./document-modal"

interface Document {
  id: string
  name: string
  description: string | null
  fileUrl: string
  fileType: string
  fileSize: number
  status: "DRAFT" | "SHARED" | "ARCHIVED"
  createdAt: Date
  client?: {
    id: string
    name: string 
  } | null
  uploadedBy: {
    id: string
    name: string | null
  }
}

// Update the interface to include clients
interface DocumentListProps {
  documents: Document[]
  userRole: string
  clients: { id: string; name: string }[]
}

// Update the function signature
export function DocumentList({ documents, userRole, clients }: DocumentListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const isMobile = !useMediaQuery("(min-width: 768px)")

  // Add state for edit modal
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null)

  // Add function to open edit modal
  const openEditModal = (doc: Document) => {
    setDocumentToEdit(doc)
    setEditModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      setIsDeleting(id)

      try {
        const response = await fetch(`/api/documents/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete document")
        }

        toast.success("Document deleted", {
          description: "The document has been deleted successfully",
        })

        // In a real app, you would update the UI here
        // For now, we'll just reload the page
        window.location.reload()
      } catch (error) {
        console.error(error)
        toast.error("Delete failed", {
          description: "There was an error deleting the document",
        })
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>
      case "SHARED":
        return <Badge variant="secondary">Shared</Badge>
      case "ARCHIVED":
        return <Badge variant="destructive">Archived</Badge>
      default:
        return null
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">No documents found</h3>
        <p className="text-sm text-gray-500 mt-2">Upload your first document to get started.</p>
      </div>
    )
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{doc.name}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/api/documents/${doc.id}/download`}>
                      <Download className="mr-2 h-4 w-4" />
                      <span>Download</span>
                    </Link>
                  </DropdownMenuItem>
                  {(userRole === "ADMIN" || userRole === "MANAGER" || doc.uploadedBy.id === "current-user-id") && (
                    <DropdownMenuItem
                      onClick={() => handleDelete(doc.id)}
                      disabled={isDeleting === doc.id}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>{isDeleting === doc.id ? "Deleting..." : "Delete"}</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>
                Type: <span className="text-foreground">{doc.fileType.toUpperCase()}</span>
              </div>
              <div>
                Size: <span className="text-foreground">{formatFileSize(doc.fileSize)}</span>
              </div>
              <div>
                Status: <span className="text-foreground">{getStatusBadge(doc.status)}</span>
              </div>
              {userRole !== "CLIENT" && doc.client && (
                <div>
                  Client: <span className="text-foreground">{doc.client.name}</span>
                </div>
              )}
              <div className="col-span-2">
                Uploaded:{" "}
                <span className="text-foreground">
                  {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Desktop view
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Status</TableHead>
            {userRole !== "CLIENT" && <TableHead>Client</TableHead>}
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">{doc.name}</TableCell>
              <TableCell>{doc.fileType.toUpperCase()}</TableCell>
              <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
              <TableCell>{getStatusBadge(doc.status)}</TableCell>
              {userRole !== "CLIENT" && <TableCell>{doc.client ? doc.client.name : "—"}</TableCell>}
              <TableCell>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</TableCell>
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
                      <Link href={`/api/documents/${doc.id}/download`}>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Download</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditModal(doc)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    {(userRole === "ADMIN" || userRole === "MANAGER" || doc.uploadedBy.id === "current-user-id") && (
                      <DropdownMenuItem
                        onClick={() => handleDelete(doc.id)}
                        disabled={isDeleting === doc.id}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>{isDeleting === doc.id ? "Deleting..." : "Delete"}</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Edit Document Modal */}
      {documentToEdit && (
        <DocumentModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          document={documentToEdit}
          clients={clients}
          mode="edit"
        />
      )}
    </div>
  )
}

