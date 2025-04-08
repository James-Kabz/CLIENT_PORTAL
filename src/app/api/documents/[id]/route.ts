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

    const { pathname } = new URL(request.url);
    const documentId = pathname.split("/").pop();
    if (!documentId) return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });

    // For multipart form data
    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const clientId = formData.get("clientId") as string
    const status = formData.get("status") as string
    const file = formData.get("file") as File | null

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

    // Check if the user has permission to update this document
    const canUpdate =
      session.user.role === "ADMIN" ||
      session.user.role === "MANAGER" ||
      existingDocument.uploadedById === session.user.id

    if (!canUpdate) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      name,
      description,
      status,
    }

    // Handle client ID
    if (clientId && clientId !== "none" && clientId !== "") {
      updateData.clientId = clientId
    } else {
      updateData.clientId = null
    }

    // Handle file update if provided
    if (file) {
      // In a real app, you would upload the file to S3 or similar
      // For this example, we'll just simulate it
      updateData.fileUrl = `https://example.com/files/${file.name}`
      updateData.fileType = file.type
      updateData.fileSize = file.size
    }

    // Update the document
    const updatedDocument = await db.document.update({
      where: {
        id: documentId,
      },
      data: updateData,
    })

    return NextResponse.json(updatedDocument)
  } catch (error) {
    console.error("Error updating document:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}


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

