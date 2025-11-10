import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArticleStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || (session.user.role !== 'PUBLISHER' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Publisher access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Valid status values based on Prisma schema
    const validStatuses = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED']
    const statusFilter = status && status !== 'ALL' && validStatuses.includes(status) ? status : null

    const articles = await prisma.article.findMany({
      where: statusFilter ? { status: statusFilter as ArticleStatus } : {},
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        featured: true,
        readTime: true,
        metaTitle: true,
        metaDescription: true,
        contentType: true,
        editionId: true,
        edition: {
          select: {
            id: true,
            title: true,
            publishDate: true,
          },
        },
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        // Remove reviewNotes from the initial list query for performance
        // Will fetch separately when needed for specific articles
      },
    })

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Error fetching publisher articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}
