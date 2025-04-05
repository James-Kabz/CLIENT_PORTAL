import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ message: "Token and password are required" }, { status: 400 })
    }

    // Find the verification token
    const verificationToken = await db.verificationToken.findUnique({
      where: {
        token,
      },
    })

    if (!verificationToken) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 })
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      return NextResponse.json({ message: "Token expired" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await hash(password, 10)

    // Update user's password
    await db.user.update({
      where: {
        email: verificationToken.identifier,
      },
      data: {
        password: hashedPassword,
      },
    })

    // Delete the verification token
    await db.verificationToken.delete({
      where: {
        id: verificationToken.id,
      },
    })

    return NextResponse.json({
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

