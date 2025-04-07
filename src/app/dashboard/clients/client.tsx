"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ClientList } from "@/components/dashboard/client-list"
import { ClientModal } from "@/components/dashboard/client-modal"

interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  createdAt: string
}

interface ClientsPageClientProps {
  initialClients: Client[]
}

export function ClientsPageClient({ initialClients }: ClientsPageClientProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client relationships</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <ClientList clients={initialClients} />

      {/* Create Client Modal */}
      <ClientModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} mode="create" />
    </div>
  )
}

