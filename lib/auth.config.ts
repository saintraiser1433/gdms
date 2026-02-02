import type { NextAuthConfig } from "next-auth"

// Edge-compatible config - NO Prisma, bcrypt, or other Node.js modules
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isLoginPage = nextUrl.pathname === "/login"
      const isAuthApi = nextUrl.pathname.startsWith("/api/auth")

      if (isAuthApi) return true
      if (isLoginPage) return isLoggedIn ? Response.redirect(new URL("/dashboard", nextUrl)) : true
      if (!isLoggedIn) return false

      // Role-based redirect for admin routes
      if (nextUrl.pathname.startsWith("/admin")) {
        const role = (auth.user as { role?: string })?.role
        if (role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", nextUrl))
        }
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string }).id
        token.role = (user as { role?: string }).role
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  providers: [], // Added in auth.ts
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig
