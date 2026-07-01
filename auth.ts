import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { getPrismaClient } from '@/lib/prisma'
import { authConfig } from './auth.config'

const db = getPrismaClient()

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  // Prisma adapter only runs in Node.js (API routes / Server Components) — never in Edge.
  ...(db && { adapter: PrismaAdapter(db) }),
  session: {
    // JWT strategy: session encoded in a signed cookie — no database round-trip per request,
    // fully compatible with the Edge Runtime middleware.
    // The Prisma adapter still persists User + Account rows on first sign-in.
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,  // 30 days
    updateAge: 24 * 60 * 60,     // re-issue every 24 h
  },
  callbacks: {
    authorized: authConfig.callbacks!.authorized,
    jwt({ token, user }) {
      // Persist the database user id inside the JWT so session() can read it.
      if (user?.id) token.sub = user.id
      return token
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
