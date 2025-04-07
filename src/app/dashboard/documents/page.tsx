import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocumentList } from "@/components/dashboard/document-list"
import { DocumentUpload } from "@/components/dashboard/document-upload"
import { authOptions } from "@/lib/auth/auth-options"
import { db } from "@/lib/db"

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Fetch documents
  const documents = await db.document.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(session.user.role === "CLIENT" ? { clientId: session.user.id } : {}),
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      uploadedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Fetch clients for the upload form
  const clients =
    session.user.role !== "CLIENT"
      ? await db.client.findMany({
          where: {
            organizationId: session.user.organizationId,
          },
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: "asc",
          },
        })
      : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Manage and share documents with your clients</p>
        </div>
        {session.user.role !== "CLIENT" && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          {session.user.role !== "CLIENT" && (
            <>
              <TabsTrigger value="shared">Shared</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
            </>
          )}
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <DocumentList documents={documents} userRole={session.user.role} />
        </TabsContent>
        {session.user.role !== "CLIENT" && (
          <>
            <TabsContent value="shared" className="mt-4">
              <DocumentList
                documents={documents.filter((doc) => doc.status === "SHARED")}
                userRole={session.user.role}
              />
            </TabsContent>
            <TabsContent value="drafts" className="mt-4">
              <DocumentList
                documents={documents.filter((doc) => doc.status === "DRAFT")}
                userRole={session.user.role}
              />
            </TabsContent>
          </>
        )}
        <TabsContent value="upload" className="mt-4">
          <div className="max-w-2xl mx-auto">
            <DocumentUpload clients={clients} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

