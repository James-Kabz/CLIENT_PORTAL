import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ClientForm } from "@/components/dashboard/client-form"
import { authOptions } from "@/lib/auth/auth-options"

export default async function NewClientPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Only admin and manager can access this page
  if (session.user.role === "CLIENT" || session.user.role === "STAFF") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/clients">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
      </div>

      <div className="max-w-2xl">
        <ClientForm />
      </div>
    </div>
  )
}

