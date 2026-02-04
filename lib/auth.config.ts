import type { NextAuthConfig } from "next-auth"

// Edge-compatible config - NO Prisma, bcrypt, or other Node.js modules
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { nextUrl } = request
      const forwardedHost = request.headers.get("x-forwarded-host")
      const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https"
      const baseUrl = forwardedHost ? `${forwardedProto}://${forwardedHost}` : nextUrl.origin

      const isLoggedIn = !!auth?.user
      const isLoginPage = nextUrl.pathname === "/login"
      const isAuthApi = nextUrl.pathname.startsWith("/api/auth")
      const isRoot = nextUrl.pathname === "/"

      if (isAuthApi) return true
      if (isRoot) return isLoggedIn ? Response.redirect(new URL("/dashboard", baseUrl)) : Response.redirect(new URL("/login", baseUrl))
      if (isLoginPage) return isLoggedIn ? Response.redirect(new URL("/dashboard", baseUrl)) : true
      if (!isLoggedIn) return false

      // Role-based redirect for admin routes
      if (nextUrl.pathname.startsWith("/admin")) {
        const role = (auth.user as { role?: string })?.role
        if (role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", baseUrl))
        }
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        const u = user as { id?: string; role?: string; position?: string }
        if (u.id) token.id = u.id
        if (u.role) token.role = u.role
        if (u.position) token.position = u.position
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.position = token.position as string | undefined
      }
      return session
    },
  },
  providers: [], // Added in auth.ts
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig
