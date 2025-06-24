import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  },
})

export async function generateSocraticQuestion(
  initialDescription: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  const prompt = `You are an expert technical specification consultant. Your role is to help founders create comprehensive technical specifications through Socratic questioning.

Context: The founder has described their idea as: "${initialDescription}"

Conversation so far:
${conversationHistory.map(entry => `${entry.role.toUpperCase()}: ${entry.content}`).join('\n')}

Your task is to ask ONE specific, insightful question that will help uncover important technical requirements, edge cases, or clarifications needed for the specification. 

Guidelines:
- Ask about specific functionality, user flows, data requirements, integrations, or technical constraints
- Focus on areas not yet covered in the conversation
- Keep questions clear and actionable
- Avoid yes/no questions when possible
- Help the founder think through implementation details

Generate your next question:`

  try {
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  } catch (error) {
    console.error('Error generating Socratic question:', error)
    throw new Error('Failed to generate question')
  }
}

export async function generateTechnicalSpec(
  initialDescription: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  const prompt = `You are an expert technical specification writer. Create a comprehensive technical specification document based on the founder's idea and our conversation.

Initial Idea: "${initialDescription}"

Full Conversation:
${conversationHistory.map(entry => `${entry.role.toUpperCase()}: ${entry.content}`).join('\n')}

Create a detailed technical specification document in markdown format that includes:

1. **Project Overview & Vision**
2. **User Personas** 
3. **Core User Stories & Acceptance Criteria**
4. **API Endpoint Specifications**
5. **Database Schema Recommendations**
6. **Non-Functional Requirements**
7. **Technical Architecture Overview**
8. **Implementation Timeline**

Format the document professionally with clear headings, bullet points, and technical details that a development team can use immediately.

Generate the complete technical specification:`

  try {
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  } catch (error) {
    console.error('Error generating technical spec:', error)
    throw new Error('Failed to generate specification')
  }
}