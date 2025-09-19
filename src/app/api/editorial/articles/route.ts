import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArticleStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['EDITOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Editor access required' },
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
      include: {
        edition: {
          select: {
            id: true,
            title: true,
            publishDate: true,
          },
        },
        reviewNotes: {
          include: {
            reviewer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Error fetching articles for editorial:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['EDITOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Editor access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      content,
      excerpt,
      slug,
      editionId,
      featured,
      readTime,
      metaTitle,
      metaDescription,
      contentType,
      status
    } = body

    // Validate required fields
    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: 'Title, content, and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    })

    if (existingArticle) {
      return NextResponse.json(
        { error: 'An article with this slug already exists' },
        { status: 400 }
      )
    }

    // Create the article
    const article = await prisma.article.create({
      data: {
        title,
        content,
        excerpt: excerpt || null,
        slug,
        status: status || 'DRAFT',
        featured: featured || false,
        readTime: readTime || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        contentType: contentType || 'HTML',
        editionId: editionId || null,
      },
      include: {
        edition: {
          select: {
            id: true,
            title: true,
            publishDate: true,
          },
        },
      },
    })

    return NextResponse.json({ 
      article,
      message: 'Article created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}
