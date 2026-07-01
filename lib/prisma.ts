import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

export const DEFAULT_USER_ID = 'default'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrisma(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) return null

  // Prisma v7+ requires a driver adapter for Postgres.
  // Pass ssl: true so Railway's PostgreSQL accepts the connection.
  const adapter = new PrismaPg({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })
  return new PrismaClient({ adapter })
}

export function getPrismaClient(): PrismaClient | null {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  const created = createPrisma()
  if (created) globalForPrisma.prisma = created
  return created
}

// Named export used by auth.ts (Auth.js Prisma Adapter needs a PrismaClient)
export const prisma = (getPrismaClient() ?? new PrismaClient()) as PrismaClient

// Avoid creating multiple Prisma instances during development HMR.
export async function getOrCreateDefaultUser() {
  const client = getPrismaClient()
  if (!client) return null

  // Single-user setup per requirements.
  return client.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: { id: DEFAULT_USER_ID },
  })
}
