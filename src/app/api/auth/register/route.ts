import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import crypto from "crypto"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email/send-verification-email"

export async function POST(req: Request) {
  try {
    const { name, email, password, organizationName } = await req.json()

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Optional: check for token collision
    const tokenExists = await db.user.findFirst({
      where: { verificationToken },
    })

    if (tokenExists) {
      return NextResponse.json({ message: "Please try again" }, { status: 500 })
    }

    // Create organization
    const organization = await db.organization.create({
      data: {
        name: organizationName,
        slug: organizationName.toLowerCase().replace(/\s+/g, "-"),
      },
    })

    console.log("Organization created:", organization.id)

    // Create user with verificationToken
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        organizationId: organization.id,
        verificationToken,
      },
    })

    console.log("User created:", user.id)

    // Create verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`

    // Send verification email
    await sendVerificationEmail(email, name, verificationToken)

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      message: "Verification email sent. Please check your inbox.",
      ...(process.env.NODE_ENV === "development" && { verificationUrl }),
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
