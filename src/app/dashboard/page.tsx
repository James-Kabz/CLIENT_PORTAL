import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authOptions } from "@/lib/auth/auth-options"
import { db } from "@/lib/db"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Fetch counts for dashboard
  const [clientCount, documentCount, taskCount, pendingTaskCount] = await Promise.all([
    db.client.count({
      where: {
        organizationId: session.user.organizationId,
      },
    }),
    db.document.count({
      where: {
        organizationId: session.user.organizationId,
        ...(session.user.role === "CLIENT" ? { clientId: session.user.id } : {}),
      },
    }),
    db.task.count({
      where: {
        organizationId: session.user.organizationId,
        ...(session.user.role === "CLIENT" ? { clientId: session.user.id } : {}),
      },
    }),
    db.task.count({
      where: {
        organizationId: session.user.organizationId,
        status: "TODO",
        ...(session.user.role === "CLIENT" ? { clientId: session.user.id } : {}),
      },
    }),
  ])

  return (
    <div className="flex flex-col min-w-full gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name}!</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {session.user.role !== "CLIENT" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientCount}</div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTaskCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Recently uploaded or shared documents</CardDescription>
          </CardHeader>
          <CardContent>
            {/* We would fetch and display recent documents here */}
            <p className="text-sm text-muted-foreground">No recent documents to display</p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            {/* We would fetch and display upcoming tasks here */}
            <p className="text-sm text-muted-foreground">No upcoming tasks to display</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

