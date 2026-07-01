import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

// Edge-safe auth guard — imports only authConfig (no Prisma, no pg, no Node.js crypto).
// Next.js 16 uses proxy.ts instead of the deprecated middleware.ts.
const { auth } = NextAuth(authConfig)

export const proxy = auth

export const config = {
  matcher: ['/dashboard/:path*'],
}
