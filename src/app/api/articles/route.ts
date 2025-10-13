import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const editionId = searchParams.get('editionId')

    if (editionId) {
      // Get articles for a specific edition
      const articles = await prisma.article.findMany({
        where: {
          editionId: editionId,
          status: 'PUBLISHED',
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'asc' },
        ],
        include: {
          edition: {
            select: {
              title: true,
              publishDate: true,
            },
          },
        },
      })

      return NextResponse.json({ articles })
    } else {
      // Get all published articles
      const articles = await prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
        },
        orderBy: [
          { publishedAt: 'desc' },
        ],
        include: {
          edition: {
            select: {
              title: true,
              publishDate: true,
            },
          },
        },
      })

      return NextResponse.json({ articles })
    }
  } catch (error) {
    // console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}
