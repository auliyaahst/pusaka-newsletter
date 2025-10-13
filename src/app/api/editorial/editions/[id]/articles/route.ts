import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Await the params
    const { id } = await params

    // Fetch the edition with articles
    const edition = await prisma.edition.findUnique({
      where: { id },
      include: {
        articles: {
          include: {
            author: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: { articles: true }
        }
      }
    })

    if (!edition) {
      return NextResponse.json(
        { error: 'Edition not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ edition })
  } catch (error) {
    console.error('Error fetching edition articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch edition articles' },
      { status: 500 }
    )
  }
}