import { NextResponse } from 'next/server'
import { DEFAULT_USER_ID, getPrismaClient } from '@/lib/prisma'
import { buildMockEventTypeStore, mapDbEventTypeToDto } from '@/lib/booking-helpers'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const username = url.searchParams.get('username')

  if (!username) {
    return NextResponse.json({ error: 'Missing username' }, { status: 400 })
  }

  const prisma = getPrismaClient()
  if (!prisma) {
    return NextResponse.json({
      user: { name: username, image: null, timezone: null },
      eventTypes: buildMockEventTypeStore().map(mapDbEventTypeToDto),
    })
  }

  // Derive username from name: lowercase, no spaces (e.g. "Ajeet Kumar" → "ajeetkumar")
  const allUsers = await prisma.user.findMany({
    where: { name: { not: null } },
    select: { id: true, name: true, image: true, timezone: true },
  })

  const match = allUsers.find(
    (u) => (u.name ?? '').toLowerCase().replace(/\s+/g, '') === username.toLowerCase()
  )

  if (!match) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  let eventTypes = await prisma.eventType.findMany({
    where: { userId: match.id },
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      bookingQuestions: { orderBy: { position: 'asc' } },
    },
  })

  // Backward compat: if the user has no events yet, include DEFAULT_USER_ID events
  if (eventTypes.length === 0 && match.id !== DEFAULT_USER_ID) {
    eventTypes = await prisma.eventType.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        bookingQuestions: { orderBy: { position: 'asc' } },
      },
    })
  }

  return NextResponse.json({
    user: { name: match.name, image: match.image, timezone: match.timezone },
    eventTypes: eventTypes.map(mapDbEventTypeToDto),
  })
}
