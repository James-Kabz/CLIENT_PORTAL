import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { db } from "@/lib/db"

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

    // In a real app, you would fetch the file from S3 or similar and stream it to the client
    // For this example, we'll just return a placeholder response
    return new NextResponse("This is a placeholder for the actual file download", {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${document.name}"`,
      },
    })
  } catch (error) {
    console.error("Error downloading document:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

