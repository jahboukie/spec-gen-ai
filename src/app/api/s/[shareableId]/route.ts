import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/s/[shareableId] - Get public shareable spec
export async function GET(
  request: NextRequest,
  { params }: { params: { shareableId: string } }
) {
  try {
    const spec = await prisma.spec.findUnique({
      where: {
        shareableId: params.shareableId
      },
      include: {
        generatedDocuments: {
          orderBy: {
            version: 'desc'
          },
          take: 1
        }
      }
    })

    if (!spec || !spec.generatedDocuments.length) {
      return NextResponse.json(
        { error: "Spec not found or not generated yet" },
        { status: 404 }
      )
    }

    const document = spec.generatedDocuments[0]

    return NextResponse.json({
      projectTitle: spec.projectTitle,
      contentMarkdown: document.contentMarkdown,
      createdAt: document.createdAt,
      version: document.version,
    })
  } catch (error) {
    console.error("Error fetching shared spec:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}