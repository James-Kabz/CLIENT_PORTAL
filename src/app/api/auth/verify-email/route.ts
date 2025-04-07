import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/email/send-welcome-email"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ message: "Verification token is required" }, { status: 400 })
    }

    // Find user with this verification token
    const user = await db.user.findFirst({
      where: {
        verificationToken: token,
      },
    })

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired verification token" }, { status: 400 })
    }

    // Update user's email verification status
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    })

    // Send welcome email
    if (user.name && user.email) {
      await sendWelcomeEmail(user.email, user.name)
    }

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

