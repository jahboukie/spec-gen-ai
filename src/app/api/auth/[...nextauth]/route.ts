import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// NextAuth v4 App Router pattern - avoid type imports to prevent CI issues
const handler = NextAuth(authOptions)

export const GET = handler
export const POST = handler