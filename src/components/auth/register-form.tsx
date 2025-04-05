"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const organizationName = formData.get("organizationName") as string

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          organizationName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Something went wrong")
        return
      }

      toast.success("Account created", {
        description: "Please check your email to verify your account",
      })

      setIsRegistered(true)
      setRegisteredEmail(email)
    } catch (error) {
      console.error(error)
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isRegistered) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Verification Email Sent</h3>
        <p className="text-sm text-muted-foreground mb-4">
          We&apos;ve sent a verification email to <strong>{registeredEmail}</strong>. Please check your inbox and click the
          verification link to complete your registration.
        </p>
        <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
          Return to Login
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <div className="mt-2">
          <Input id="name" name="name" type="text" autoComplete="name" required />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email address</Label>
        <div className="mt-2">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="mt-2">
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
        </div>
      </div>

      <div>
        <Label htmlFor="organizationName">Organization Name</Label>
        <div className="mt-2">
          <Input id="organizationName" name="organizationName" type="text" required />
        </div>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      <div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </div>
    </form>
  )
}

