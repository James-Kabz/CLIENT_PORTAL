import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ClientList } from "@/components/dashboard/client-list"
import { authOptions } from "@/lib/auth/auth-options"
import { db } from "@/lib/db"

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
  const clients = await db.client.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client relationships</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      <ClientList clients={clients} />
    </div>
  )
}

