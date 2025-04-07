"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { CheckCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Verification token is missing")
        setIsVerifying(false)
        return
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Failed to verify email") // <-- this still reads the message even if token is wrong
        }

        setIsSuccess(true)
        toast.success("Email verified successfully")

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Verification failed")
        toast.error("Verification failed", {
          description: error instanceof Error ? error.message : "Something went wrong",
        })
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card px-4 py-8 shadow sm:rounded-lg sm:px-10 text-center">
          {isVerifying ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <h2 className="text-xl font-semibold">Verifying your email...</h2>
              <p className="mt-2 text-muted-foreground">Please wait while we verify your email address.</p>
            </div>
          ) : isSuccess ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold">Email Verified!</h2>
              <p className="mt-2 text-muted-foreground">Your email has been successfully verified.</p>
              <Button asChild className="mt-6">
                <Link href="/login">Continue to Login</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <XCircle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold">Verification Failed</h2>
              <p className="mt-2 text-muted-foreground">{error || "There was an error verifying your email."}</p>
              <div className="mt-6 space-y-4">
                <Button asChild>
                  <Link href="/login">Return to Login</Link>
                </Button>
                <div>
                  <p className="text-sm text-muted-foreground mt-4">Didn&apos;t receive a verification email?</p>
                  <Button variant="link" asChild>
                    <Link href="/resend-verification">Resend verification email</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

