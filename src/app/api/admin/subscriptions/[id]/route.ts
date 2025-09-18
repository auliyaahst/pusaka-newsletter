import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const updates = await request.json()

    // Allow updating subscription-related fields
    const allowedUpdates = ['subscriptionType', 'subscriptionStart', 'subscriptionEnd', 'isActive']
    const filteredUpdates: any = {}
    
    for (const key of allowedUpdates) {
      if (key in updates) {
        filteredUpdates[key] = updates[key]
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: filteredUpdates,
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionType: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        isActive: true,
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
