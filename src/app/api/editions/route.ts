import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const editions = await prisma.edition.findMany({
      where: {
        isPublished: true
      },
      include: {
        articles: {
          where: {
            status: 'PUBLISHED'
          },
          select: {
            id: true,
            title: true,
            excerpt: true,
            slug: true,
            featured: true,
            readTime: true,
            publishedAt: true,
            editionId: true
          },
          orderBy: [
            { order: 'asc' },
            { createdAt: 'asc' }
          ]
        },
        _count: {
          select: { articles: true }
        }
      },
      orderBy: {
        publishDate: 'desc'
      }
    })

    return NextResponse.json({ editions })
  } catch (error) {
    // console.error('Error fetching editions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch editions' },
      { status: 500 }
    )
  }
}
