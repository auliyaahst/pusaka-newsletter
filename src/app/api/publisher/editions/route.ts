import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Editors, Publishers and Super Admins can access all editions (excluding regular ADMIN)
    if (!['EDITOR', 'PUBLISHER', 'SUPER_ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json(
        { error: 'Forbidden - Editor access required' },
        { status: 403 }
      )
    }

    const editions = await prisma.edition.findMany({
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

    return NextResponse.json({ editions }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching publisher editions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch editions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  console.log('🚀 POST /api/publisher/editions - Creating new edition')
  
  try {
    const session = await getServerSession(authOptions)
    console.log('👤 Session check - User:', session?.user?.email, 'Role:', session?.user?.role)
    
    if (!session?.user) {
      console.log('❌ Unauthorized - No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only Editors, Publishers and Super Admins can create editions (excluding regular ADMIN)
    if (!['EDITOR', 'PUBLISHER', 'SUPER_ADMIN'].includes(session.user.role || '')) {
      console.log('❌ Forbidden - User role:', session.user.role, 'Required: EDITOR/PUBLISHER/SUPER_ADMIN')
      return NextResponse.json(
        { error: 'Forbidden - Editor access required' },
        { status: 403 }
      )
    }

    console.log('✅ Authorization passed - User can create editions')
    const body = await request.json()
    console.log('📝 Request body:', JSON.stringify(body, null, 2))
    const { title, description, publishDate, editionNumber, theme, coverImage } = body

    if (!title || !publishDate) {
      console.log('❌ Validation failed - Missing required fields:', { title: !!title, publishDate: !!publishDate })
      return NextResponse.json(
        { error: 'Title and publish date are required' },
        { status: 400 }
      )
    }

    console.log('📊 Creating edition with data:', { title, description, publishDate, editionNumber, theme, coverImage })

    // Check if edition number already exists
    if (editionNumber) {
      console.log('🔍 Checking for existing edition number:', editionNumber)
      const existingEdition = await prisma.edition.findFirst({
        where: { editionNumber: parseInt(editionNumber) }
      })
      
      if (existingEdition) {
        console.log('❌ Edition number conflict - Number already exists:', editionNumber)
        return NextResponse.json(
          { error: 'Edition number already exists' },
          { status: 400 }
        )
      }
      console.log('✅ Edition number is available:', editionNumber)
    }

    console.log('💾 Creating edition in database...')
    const edition = await prisma.edition.create({
      data: {
        title,
        description: description || null,
        publishDate: new Date(publishDate),
        editionNumber: editionNumber ? parseInt(editionNumber) : null,
        theme: theme || null,
        coverImage: coverImage || null,
        isPublished: true, // Editions created by publishers are automatically published
      },
      include: {
        articles: {
          where: {
            status: 'PUBLISHED',
          },
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

    console.log('✅ Edition created successfully:', {
      id: edition.id,
      title: edition.title,
      editionNumber: edition.editionNumber,
      isPublished: edition.isPublished,
      articlesCount: edition._count.articles
    })

    return NextResponse.json(
      { 
        message: 'Edition created successfully',
        edition 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('💥 Error creating edition:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to create edition' },
      { status: 500 }
    )
  }
}
