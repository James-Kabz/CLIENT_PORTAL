import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth/auth-options"
import { db } from "@/lib/db"
import { ClientsPageClient } from "./client"

export default async function ClientsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Only admin and manager can access this page
  if (session.user.role === "CLIENT" || session.user.role === "STAFF") {
    redirect("/dashboard")
  }

  // Fetch clients
  const clientsData = await db.client.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    orderBy: {
      name: "asc",
    },
  })

  // Convert Date objects to strings
  const clients = clientsData.map((client) => ({
    ...client,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  }))

  return <ClientsPageClient initialClients={clients} />
}

