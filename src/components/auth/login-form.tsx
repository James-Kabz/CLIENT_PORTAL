"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setUnverifiedEmail(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "Please verify your email before logging in") {
          setError("Please verify your email before logging in")
          setUnverifiedEmail(email)
          toast.error("Email not verified", {
            description: "Please check your inbox for the verification email",
          })
        } else {
          setError("Invalid email or password")
        }
        return
      }

      toast.success("Logged in successfully")
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="email">Email address</Label>
        <div className="mt-2">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <div className="text-sm">
            <Link href="/forgot-password" className="font-medium text-primary hover:text-primary/90">
              Forgot your password?
            </Link>
          </div>
        </div>
        <div className="mt-2">
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive">
          {error}
          {unverifiedEmail && (
            <div className="mt-2">
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-sm"
                onClick={async () => {
                  try {
                    setIsLoading(true)
                    const response = await fetch("/api/auth/resend-verification", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ email: unverifiedEmail }),
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
                  } finally {
                    setIsLoading(false)
                  }
                }}
              >
                Resend verification email
              </Button>
            </div>
          )}
        </div>
      )}

      <div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          disabled={isLoading}
        >
          Google
        </Button>
      </div>
    </form>
  )
}

