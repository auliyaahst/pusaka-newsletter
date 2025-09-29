import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const article = await prisma.article.update({
      where: { id: resolvedParams.id },
      data: { status: 'ARCHIVED' as const },
      include: {
        edition: true
      }
    })

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error archiving article:', error)
    return NextResponse.json(
      { error: 'Failed to archive article' },
      { status: 500 }
    )
  }
}