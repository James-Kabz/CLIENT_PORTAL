"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocumentList } from "@/components/dashboard/document-list"
import { DocumentModal } from "@/components/dashboard/document-modal"

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
  uploadedBy: {
    id: string
    name: string | null
  }
  createdAt: Date
}

interface DocumentsPageClientProps {
  initialDocuments: Document[]
  clients: Client[]
  userRole: string
}

export function DocumentsPageClient({ initialDocuments, clients, userRole }: DocumentsPageClientProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const allDocuments = initialDocuments
  const sharedDocuments = initialDocuments.filter((doc) => doc.status === "SHARED")
  const draftDocuments = initialDocuments.filter((doc) => doc.status === "DRAFT")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Manage and share documents with your clients</p>
        </div>
        {userRole !== "CLIENT" && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          {userRole !== "CLIENT" && (
            <>
              <TabsTrigger value="shared">Shared</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
            </>
          )}
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <DocumentList documents={allDocuments} userRole={userRole} clients={clients} />
        </TabsContent>
        {userRole !== "CLIENT" && (
          <>
            <TabsContent value="shared" className="mt-4">
              <DocumentList documents={sharedDocuments} userRole={userRole} clients={clients} />
            </TabsContent>
            <TabsContent value="drafts" className="mt-4">
              <DocumentList documents={draftDocuments} userRole={userRole} clients={clients} />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Create Document Modal */}
      <DocumentModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} clients={clients} mode="create" />
    </div>
  )
}

