import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['EDITOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Editor access required' },
        { status: 403 }
      )
    }

    const { decision, note } = await request.json()
    const { id: articleId } = await params

    // Validate decision
    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be APPROVED or REJECTED' },
        { status: 400 }
      )
    }

    // Check if article exists and is under review
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    if (existingArticle.status !== 'UNDER_REVIEW') {
      return NextResponse.json(
        { error: 'Article is not under review' },
        { status: 400 }
      )
    }

    // Update article with review decision
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        status: decision,
        ...(decision === 'APPROVED' && !existingArticle.publishedAt && {
          publishedAt: new Date(),
        }),
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

    // Here you could also create a review log record if you want to track review history
    // For now, we'll just log the note if provided
    if (note) {
      console.log(`Article ${articleId} reviewed by ${session.user.email}: ${note}`)
    }

    return NextResponse.json({ 
      article: updatedArticle,
      message: `Article ${decision.toLowerCase()} successfully` 
    })
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}
