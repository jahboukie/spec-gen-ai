import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSocraticQuestion } from "@/lib/gemini"
import { z } from "zod"

const dialogueSchema = z.object({
  message: z.string().min(1, "Message is required"),
})

// POST /api/specs/[specId]/dialogue - Send user message and get AI question
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

    const body = await request.json()
    const { message } = dialogueSchema.parse(body)

    // Verify spec ownership
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

    // Get next sequence order
    const nextSequenceOrder = spec.dialogueEntries.length

    // Save user message
    await prisma.dialogueEntry.create({
      data: {
        specId: params.specId,
        role: 'USER',
        content: message,
        sequenceOrder: nextSequenceOrder,
      }
    })

    // Prepare conversation history for AI
    const conversationHistory = [
      ...spec.dialogueEntries.map(entry => ({
        role: entry.role.toLowerCase(),
        content: entry.content
      })),
      { role: 'user', content: message }
    ]

    // Generate AI question
    const aiQuestion = await generateSocraticQuestion(
      spec.initialDescription,
      conversationHistory
    )

    // Save AI response
    await prisma.dialogueEntry.create({
      data: {
        specId: params.specId,
        role: 'AI',
        content: aiQuestion,
        sequenceOrder: nextSequenceOrder + 1,
      }
    })

    return NextResponse.json({ 
      userMessage: message,
      aiQuestion 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error in dialogue:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}