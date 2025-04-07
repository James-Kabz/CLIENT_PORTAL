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

interface Client {
  id: string 
  name: string
}

interface DocumentUploadProps {
  clients: Client[]
}

export function DocumentUpload({ clients }: DocumentUploadProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
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

    if (!file) {
      toast.error("No file selected", {
        description: "Please select a file to upload",
      })
      return
    }

    setIsUploading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("file", file)

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload document")
      }

      toast.success("Document uploaded", {
        description: "Your document has been uploaded successfully",
      })

      router.refresh()
      setFile(null)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error(error)
      toast.error("Upload failed", {
        description: "There was an error uploading your document",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Document Name</Label>
        <Input id="name" name="name" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" />
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

      <Button type="submit" disabled={isUploading || !file}>
        {isUploading ? "Uploading..." : "Upload Document"}
      </Button>
    </form>
  )
}

