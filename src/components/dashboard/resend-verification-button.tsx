"use client"

import { ComponentPropsWithoutRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface ResendVerificationButtonProps extends ComponentPropsWithoutRef<typeof Button> {
    email: string
  }

export function ResendVerificationButton({ email, className, ...props }: ResendVerificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleResendVerification = async () => {
    if (!email) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
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
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleResendVerification}
      disabled={isLoading}
      className={className}
      {...props}
    >
      {isLoading ? "Sending..." : "Resend"}
    </Button>
  )
}

