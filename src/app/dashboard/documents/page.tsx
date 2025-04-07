import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth/auth-options"
import { db } from "@/lib/db"

// Import the client component
import { DocumentsPageClient } from "./client"

// Update the component to use the client component
export default async function DocumentsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Fetch documents
  const documentsData = await db.document.findMany({
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

  // Convert Date objects to strings
  const documents = documentsData.map((doc) => ({
    ...doc,
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
  }))

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

  return <DocumentsPageClient initialDocuments={documents} clients={clients} userRole={session.user.role} />
}

