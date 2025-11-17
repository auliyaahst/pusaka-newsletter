import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const article = await prisma.article.findUnique({
      where: {
        slug: slug,
        status: 'PUBLISHED',
      },
      include: {
        edition: {
          select: {
            id: true,
            title: true,
            publishDate: true,
            editionNumber: true,
            coverImage: true,
          },
        },
      },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Find the next article in the same edition
    let nextArticle = null
    if (article.editionId) {
      // Get all articles in the same edition ordered by their order field
      const articlesInEdition = await prisma.article.findMany({
        where: {
          editionId: article.editionId,
          status: 'PUBLISHED',
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'asc' },
        ],
        select: {
          id: true,
          title: true,
          slug: true,
          order: true,
          createdAt: true,
        },
      })

      // Find current article's index and get the next one
      const currentIndex = articlesInEdition.findIndex(a => a.id === article.id)
      if (currentIndex !== -1 && currentIndex < articlesInEdition.length - 1) {
        nextArticle = articlesInEdition[currentIndex + 1]
      }
    }

    return NextResponse.json({ article, nextArticle })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}
