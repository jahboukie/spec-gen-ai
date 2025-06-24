import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSpecSchema = z.object({
  projectTitle: z.string().min(1, "Project title is required"),
  initialDescription: z.string().min(10, "Description must be at least 10 characters"),
})

// GET /api/specs - Get all specs for authenticated user
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const specs = await prisma.spec.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        projectTitle: true,
        initialDescription: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            dialogueEntries: true,
            generatedDocuments: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({ specs })
  } catch (error) {
    console.error("Error fetching specs:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/specs - Create new spec
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { projectTitle, initialDescription } = createSpecSchema.parse(body)

    const spec = await prisma.spec.create({
      data: {
        userId: session.user.id,
        projectTitle,
        initialDescription,
        status: 'DRAFT',
      },
      select: {
        id: true,
        projectTitle: true,
        initialDescription: true,
        status: true,
        createdAt: true,
      }
    })

    return NextResponse.json({ spec }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating spec:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}