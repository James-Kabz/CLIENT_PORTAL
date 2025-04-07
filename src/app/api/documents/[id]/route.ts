import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { db } from "@/lib/db"

export async function DELETE(request: Request,) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { pathname } = new URL(request.url);
    const documentId = pathname.split("/").pop();
    if (!documentId) return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });

    // Verify the document exists and belongs to the user's organization
    const existingDocument = await db.document.findFirst({
      where: {
        id: documentId,
        organizationId: session.user.organizationId,
      },
    })

    if (!existingDocument) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 })
    }

    // Check if the user has permission to delete this document
    const canDelete =
      session.user.role === "ADMIN" ||
      session.user.role === "MANAGER" ||
      existingDocument.uploadedById === session.user.id

    if (!canDelete) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Delete the document
    await db.document.delete({
      where: {
        id: documentId,
      },
    })

    return NextResponse.json({ message: "Document deleted successfully" })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { pathname } = new URL(request.url);
    const documentId = pathname.split("/").pop();
    if (!documentId) return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });

    // Verify the document exists and belongs to the user's organization
    const document = await db.document.findFirst({
      where: {
        id: documentId,
        organizationId: session.user.organizationId,
        ...(session.user.role === "CLIENT" ? { clientId: session.user.id } : {}),
      },
    })

    if (!document) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 })
    }

    // In a real app, you would fetch the file from S3 or similar
    // For this example, we'll just return a placeholder response
    return NextResponse.json(document)
  } catch (error) {
    console.error("Error fetching document:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

