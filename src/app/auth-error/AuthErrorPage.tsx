"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const [errorMessage, setErrorMessage] = useState("An authentication error occurred")
  const [isEmailVerification, setIsEmailVerification] = useState(false)

  useEffect(() => {
    if (error) {
      switch (error) {
        case "Verification":
          setErrorMessage("Please verify your email before logging in")
          setIsEmailVerification(true)
          break
        case "CredentialsSignin":
          setErrorMessage("Invalid email or password")
          break
        case "OAuthAccountNotLinked":
          setErrorMessage("This email is already associated with another account")
          break
        case "OAuthSignin":
        case "OAuthCallback":
          setErrorMessage("There was a problem with the OAuth provider")
          break
        case "SessionRequired":
          setErrorMessage("You must be signed in to access this page")
          break
        default:
          setErrorMessage("An authentication error occurred")
      }
    }
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Authentication Error</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">{errorMessage}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card px-4 py-8 shadow sm:rounded-lg sm:px-10 text-center">
          {isEmailVerification ? (
            <div className="space-y-4">
              <p>
                You need to verify your email address before you can log in. Please check your inbox for the
                verification email.
              </p>
              <Button asChild>
                <Link href="/resend-verification">Resend verification email</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button asChild>
                <Link href="/login">Return to login</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
