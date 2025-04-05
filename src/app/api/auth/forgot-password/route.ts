import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { db } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset-email"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Find the user
    const user = await db.user.findUnique({
      where: {
        email,
      },
    })

    // Don't reveal if the user exists or not for security reasons
    if (!user) {
      return NextResponse.json({
        message: "If your email is registered, you will receive a password reset link",
      })
    }

    // Create a password reset token
    const token = randomUUID()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Check if a token already exists for this user
    const existingToken = await db.verificationToken.findFirst({
      where: {
        identifier: email,
      },
    })

    // Delete existing token if it exists
    if (existingToken) {
      await db.verificationToken.delete({
        where: {
          id: existingToken.id,
        },
      })
    }

    // Create a new token
    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    // Send password reset email
    await sendPasswordResetEmail(email, user.name, token)

    return NextResponse.json({
      message: "If your email is registered, you will receive a password reset link",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

