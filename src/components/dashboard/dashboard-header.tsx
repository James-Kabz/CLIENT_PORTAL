"use client"

import Link from "next/link"
import { Bell, AlertTriangle } from "lucide-react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"
import { toast } from "sonner"

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    emailVerified?: Date | null
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { data: session } = useSession()
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U"

  const isEmailVerified = !!user.emailVerified

  const handleResendVerification = async () => {
    if (!session?.user.email) return

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: session.user.email }),
      })

      if (response.ok) {
        toast.success("Verification email sent", {
          description: "Please check your inbox for the verification email",
        })
      } else {
        throw new Error("Failed to resend verification email")
      }
    } catch (error) {
      toast.error("Error", {
         description: error instanceof Error ? error.message : "Failed to resend verification email",
      })
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 lg:px-8">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-primary text-lg md:text-xl">Client Portal</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {!isEmailVerified && (
          <Button
            variant="outline"
            size="sm"
            className="text-amber-500 border-amber-500 hover:bg-amber-50 hidden md:flex"
            onClick={handleResendVerification}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Verify Email
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {!isEmailVerified && (
              <div className="p-4 text-sm border-l-4 border-amber-500 bg-amber-50 text-amber-800">
                <div className="font-medium flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Email not verified
                </div>
                <p className="mt-1">Please verify your email address to ensure account security.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-amber-600 border-amber-600 hover:bg-amber-100"
                  onClick={handleResendVerification}
                >
                  Resend verification email
                </Button>
              </div>
            )}
            <div className="text-sm text-muted-foreground p-4">No new notifications</div>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            {!isEmailVerified && (
              <>
                <DropdownMenuItem
                  className="text-amber-600 focus:text-amber-600 focus:bg-amber-50"
                  onClick={handleResendVerification}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Verify Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

