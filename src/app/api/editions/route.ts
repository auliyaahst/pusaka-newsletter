import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const editions = await prisma.edition.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [
        { publishDate: 'desc' },
      ],
      include: {
        articles: {
          where: {
            status: 'PUBLISHED',
          },
          orderBy: [
            { order: 'asc' },
            { createdAt: 'asc' },
          ],
          select: {
            id: true,
            title: true,
            excerpt: true,
            slug: true,
            featured: true,
            readTime: true,
            publishedAt: true,
          },
        },
        _count: {
          select: {
            articles: {
              where: {
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ editions })
  } catch (error) {
    console.error('Error fetching editions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch editions' },
      { status: 500 }
    )
  }
}
