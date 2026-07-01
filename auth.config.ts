import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

// This file is intentionally free of Node.js-only imports (no Prisma, no `pg`).
// It runs in the Edge Runtime as part of middleware.
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: '/',
    error: '/',
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtected = nextUrl.pathname.startsWith('/dashboard')
      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl))
      }
      return true
    },
  },
} satisfies NextAuthConfig
