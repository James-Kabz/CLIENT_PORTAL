"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, CheckSquare, Settings, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

interface DashboardNavProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const isAdmin = user.role === "ADMIN"
  const isManager = user.role === "MANAGER" || isAdmin
  const isClient = user.role === "CLIENT"

  return (
    <Sidebar className="fixed left-0 top-16 bottom-0 z-20 border-r border-border">
      <SidebarHeader className="flex items-center px-4 py-2">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary"></div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{user.name || "User"}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="hidden md:flex">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard" className="flex items-center">
                    <LayoutDashboard className="h-5 w-5 md:mr-2 md:h-4 md:w-4" />
                    <span className="hidden md:inline">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {!isClient && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/clients")}>
                    <Link href="/dashboard/clients" className="flex items-center">
                      <Users className="h-5 w-5 md:mr-2 md:h-4 md:w-4" />
                      <span className="hidden md:inline">Clients</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/documents")}>
                  <Link href="/dashboard/documents" className="flex items-center">
                    <FileText className="h-5 w-5 md:mr-2 md:h-4 md:w-4" />
                    <span className="hidden md:inline">Documents</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/tasks")}>
                  <Link href="/dashboard/tasks" className="flex items-center">
                    <CheckSquare className="h-5 w-5 md:mr-2 md:h-4 md:w-4" />
                    <span className="hidden md:inline">Tasks</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {isManager && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/settings")}>
                    <Link href="/dashboard/settings" className="flex items-center">
                      <Settings className="h-5 w-5 md:mr-2 md:h-4 md:w-4" />
                      <span className="hidden md:inline">Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button variant="outline" className="w-full justify-start" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">Log out</span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
