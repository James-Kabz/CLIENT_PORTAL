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

    // In a real app, you would upload the file to S3 or similar
    // For this example, we'll just simulate it
    const formData = await req.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const clientId = formData.get("clientId") as string
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // Simulate file upload and get URL
    const fileUrl = `https://example.com/files/${file.name}`

    const document = await db.document.create({
      data: {
        name,
        description,
        fileUrl,
        fileType: file.type,
        fileSize: file.size,
        status: "DRAFT",
        organizationId: session.user.organizationId,
        uploadedById: session.user.id,
        ...(clientId ? { clientId } : {}),
      },
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

