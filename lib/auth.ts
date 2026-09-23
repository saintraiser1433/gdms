import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

import { authConfig } from "./auth.config"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    role: string
    position?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      position?: string
    }
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: string
    position?: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    console.log("[DEBUG] missing email or password")
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email as string }
  })

  console.log("[DEBUG] user found:", !!user, "status:", user?.status)

  if (!user) {
    return null
  }

  const isPasswordValid = await bcrypt.compare(
    credentials.password as string,
    user.passwordHash
  )

  console.log("[DEBUG] password valid:", isPasswordValid)

  if (!isPasswordValid) {
    return null
  }

  if (user.status === "INACTIVE") {
    console.log("[DEBUG] user inactive")
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    position: user.position ?? undefined
  }
}
    })
  ],
})
