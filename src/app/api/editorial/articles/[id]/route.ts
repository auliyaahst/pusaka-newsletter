import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has EDITOR or ADMIN role
    if (!['EDITOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
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
      contentType
    } = body

    if (!title || !content) {
      return NextResponse.json(
        { message: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Check if the article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      )
    }

    // Check if slug is unique (excluding current article)
    if (slug !== existingArticle.slug) {
      const slugExists = await prisma.article.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      })

      if (slugExists) {
        return NextResponse.json(
          { message: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update the article
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        title,
        content,
        excerpt: excerpt || null,
        slug,
        editionId: editionId || null,
        featured: featured || false,
        readTime: readTime || 5,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        contentType: contentType || 'HTML',
        updatedAt: new Date()
      },
      include: {
        edition: {
          select: {
            id: true,
            title: true,
            editionNumber: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Article updated successfully',
      article: updatedArticle
    })

  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
