import { NextResponse } from 'next/server'
import { getOrCreateDefaultUser, getPrismaClient } from '@/lib/prisma'
import { buildMockEventTypeStore, mapDbEventTypeToDto } from '@/lib/booking-helpers'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  await getOrCreateDefaultUser()
  const prisma = getPrismaClient()
  if (!prisma) {
    const eventType = buildMockEventTypeStore().find((et) => et.slug === slug)
    if (!eventType) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ eventType })
  }

  const eventType = await prisma.eventType.findUnique({
    where: { slug },
    include: {
      user: true,
      bookingQuestions: {
        orderBy: { position: 'asc' },
      },
    },
  })

  if (!eventType) {
    return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
  }

  return NextResponse.json({
    eventType: mapDbEventTypeToDto(eventType),
  })
}
