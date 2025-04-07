import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { db } from "@/lib/db"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Only admin and manager can update clients
    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { pathname } = new URL(request.url);
    const clientId = pathname.split("/").pop();
    if (!clientId) return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    const data = await request.json()

    // Verify the client exists and belongs to the user's organization
    const existingClient = await db.client.findFirst({
      where: {
        id: clientId,
        organizationId: session.user.organizationId,
      },
    })

    if (!existingClient) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 })
    }

    // Update the client
    const updatedClient = await db.client.update({
      where: {
        id: clientId,
      },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        // Ensure organizationId can't be modified
        organizationId: undefined,
      },
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Only admin and manager can delete clients
    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { pathname } = new URL(request.url);
    const clientId = pathname.split("/").pop();
    if (!clientId) return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });

    // Verify the client exists and belongs to the user's organization
    const existingClient = await db.client.findFirst({
      where: {
        id: clientId,
        organizationId: session.user.organizationId,
      },
    })

    if (!existingClient) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 })
    }

    // Delete the client
    await db.client.delete({
      where: {
        id: clientId,
      },
    })

    return NextResponse.json({ message: "Client deleted successfully" })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

