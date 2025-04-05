import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { randomUUID } from "crypto"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email/send-verification-email"

export async function POST(req: Request) {
  try {
    const { name, email, password, organizationName } = await req.json()

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create organization
    const organization = await db.organization.create({
      data: {
        name: organizationName,
        slug: organizationName.toLowerCase().replace(/\s+/g, "-"),
      },
    })

    console.log("Organization created:", organization.id)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        organizationId: organization.id,
      },
    })

    // Create verification token
    const token = randomUUID()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

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
    const verificationToken = await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    console.log("Verification token created:", verificationToken.id)

    // Send verification email
    await sendVerificationEmail(email, name, token)

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      message: "Verification email sent. Please check your inbox.",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

