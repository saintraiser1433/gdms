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
      const isRoot = nextUrl.pathname === "/"

      if (isAuthApi) return true
      if (isRoot) return isLoggedIn ? Response.redirect(new URL("/dashboard", nextUrl)) : Response.redirect(new URL("/login", nextUrl))
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
        const u = user as { id?: string; role?: string }
        if (u.id) token.id = u.id
        if (u.role) token.role = u.role
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
