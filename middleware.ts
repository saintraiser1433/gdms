import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

// Uses only auth.config (Edge-compatible) - avoids loading Prisma/bcrypt
export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
