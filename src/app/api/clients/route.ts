import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Only admin and manager can create clients
    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { name, email, phone, address, notes } = await req.json()

    const client = await db.client.create({
      data: {
        name,
        email,
        phone,
        address,
        notes,
        organizationId: session.user.organizationId,
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

