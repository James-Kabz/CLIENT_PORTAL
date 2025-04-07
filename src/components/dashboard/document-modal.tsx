"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Client {
  id: string
  name: string
}

interface Document {
  id: string
  name: string
  description: string | null
  fileUrl: string
  fileType: string
  fileSize: number
  status: "DRAFT" | "SHARED" | "ARCHIVED"
  client?: {
    id: string
    name: string
  } | null
}

interface DocumentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document?: Document
  clients: Client[]
  mode: "create" | "edit"
}

export function DocumentModal({ open, onOpenChange, document, clients, mode }: DocumentModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState(document?.name || "")
  const [description, setDescription] = useState(document?.description || "")
  const [clientId, setClientId] = useState(document?.client?.id || "")
  const [status, setStatus] = useState(document?.status || "DRAFT")
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description || "")
      formData.append("clientId", clientId || "")
      formData.append("status", status)

      if (mode === "create" && !file) {
        toast.error("No file selected", {
          description: "Please select a file to upload",
        })
        setIsSubmitting(false)
        return
      }

      if (file) {
        formData.append("file", file)
      }

      const url = mode === "create" ? "/api/documents" : `/api/documents/${document?.id}`
      const method = mode === "create" ? "POST" : "PATCH"

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Failed to ${mode} document`)
      }

      toast.success(`Document ${mode === "create" ? "uploaded" : "updated"}`, {
        description: `Your document has been ${mode === "create" ? "uploaded" : "updated"} successfully`,
      })

      router.refresh()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error(error)
      toast.error(`${mode === "create" ? "Upload" : "Update"} failed`, {
        description: `There was an error ${mode === "create" ? "uploading" : "updating"} your document`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setClientId("")
    setStatus("DRAFT")
    setFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Upload" : "Edit"} Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Document Name</Label>
            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
            />
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
            <Label htmlFor="status">Status</Label>
            <Select name="status" value={status} onValueChange={(value) => setStatus(value as "DRAFT" | "SHARED" | "ARCHIVED")}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SHARED">Shared</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              {!file ? (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX up to 10MB</p>
                    </div>
                    <Input id="file" type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className="ml-3 text-sm">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

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
            <Button type="submit" disabled={isSubmitting || (mode === "create" && !file)}>
              {isSubmitting
                ? `${mode === "create" ? "Uploading" : "Updating"}...`
                : mode === "create"
                  ? "Upload Document"
                  : "Update Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

