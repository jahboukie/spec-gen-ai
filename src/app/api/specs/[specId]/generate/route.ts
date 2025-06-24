import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateTechnicalSpec } from "@/lib/gemini"
import { nanoid } from "nanoid"

// POST /api/specs/[specId]/generate - Generate final technical specification
export async function POST(
  request: NextRequest,
  { params }: { params: { specId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify spec ownership and get conversation history
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
        }
      }
    })

    if (!spec) {
      return NextResponse.json(
        { error: "Spec not found" },
        { status: 404 }
      )
    }

    // Prepare conversation history for AI
    const conversationHistory = spec.dialogueEntries.map(entry => ({
      role: entry.role.toLowerCase(),
      content: entry.content
    }))

    // Generate technical specification
    const technicalSpec = await generateTechnicalSpec(
      spec.initialDescription,
      conversationHistory
    )

    // Get next version number
    const existingDocs = await prisma.generatedDocument.findMany({
      where: { specId: params.specId },
      select: { version: true },
      orderBy: { version: 'desc' },
      take: 1
    })

    const nextVersion = existingDocs.length > 0 ? existingDocs[0].version + 1 : 1

    // Save generated document
    const document = await prisma.generatedDocument.create({
      data: {
        specId: params.specId,
        contentMarkdown: technicalSpec,
        version: nextVersion,
      }
    })

    // Generate shareable ID if not exists
    let shareableId = spec.shareableId
    if (!shareableId) {
      shareableId = nanoid(12)
      await prisma.spec.update({
        where: { id: params.specId },
        data: { 
          shareableId,
          status: 'COMPLETED'
        }
      })
    } else {
      // Update status to completed
      await prisma.spec.update({
        where: { id: params.specId },
        data: { status: 'COMPLETED' }
      })
    }

    return NextResponse.json({ 
      document: {
        id: document.id,
        contentMarkdown: document.contentMarkdown,
        version: document.version,
        createdAt: document.createdAt
      },
      shareableId 
    })
  } catch (error) {
    console.error("Error generating spec:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}