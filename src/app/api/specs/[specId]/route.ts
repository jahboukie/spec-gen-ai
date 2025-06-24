import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/specs/[specId] - Get spec details with conversation history
export async function GET(
  request: NextRequest,
  { params }: { params: { specId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const spec = await prisma.spec.findFirst({
      where: {
        id: params.specId,
        userId: session.user.id
      },
      include: {
        dialogueEntries: {
          orderBy: {
            sequenceOrder: 'asc'
          }
        },
        generatedDocuments: {
          orderBy: {
            version: 'desc'
          },
          take: 1
        }
      }
    })

    if (!spec) {
      return NextResponse.json(
        { error: "Spec not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ spec })
  } catch (error) {
    console.error("Error fetching spec:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}