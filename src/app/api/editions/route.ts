import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    console.log('API: Fetching editions from database...')
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
            content: true,
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

    console.log(`API: Found ${editions.length} published editions`)
    editions.forEach((edition, index) => {
      console.log(`API: Edition ${index + 1}: ${edition.title} (ID: ${edition.id}, Number: ${edition.editionNumber})`)
    })

    return NextResponse.json({ editions }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching editions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch editions' },
      { status: 500 }
    )
  }
}
