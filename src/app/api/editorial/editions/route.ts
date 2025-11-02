import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Editors, Publishers and above can see all editions to assign articles to
    if (!['EDITOR', 'PUBLISHER', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json(
        { error: 'Forbidden - Editor access required' },
        { status: 403 }
      )
    }

    // Fetch all editions (both published and draft) for editorial use
    const editions = await prisma.edition.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        publishDate: true,
        editionNumber: true,
        isPublished: true,
        coverImage: true,  // ← ADD THIS LINE
        theme: true,       // ← ADD THIS LINE
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: {
        publishDate: 'desc'
      }
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

export async function POST(request: Request) {
  console.log('📚 POST /api/editorial/editions - Creating new edition (editorial)')
  
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

    // Editors, Publishers and above can create editions
    if (!['EDITOR', 'PUBLISHER', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')) {
      console.log('❌ Forbidden - User role:', session.user.role, 'Required: EDITOR/PUBLISHER/ADMIN/SUPER_ADMIN')
      return NextResponse.json(
        { error: 'Forbidden - Editor access required' },
        { status: 403 }
      )
    }

    console.log('✅ Authorization passed - User can create editions')
    const body = await request.json()
    console.log('📝 Request body:', JSON.stringify(body, null, 2))
    const { title, description, publishDate, editionNumber, theme } = body

    if (!title || !publishDate) {
      console.log('❌ Validation failed - Missing required fields:', { title: !!title, publishDate: !!publishDate })
      return NextResponse.json(
        { error: 'Title and publish date are required' },
        { status: 400 }
      )
    }

    console.log('📊 Creating edition with data:', { title, description, publishDate, editionNumber, theme })

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
        isPublished: true, // Editions created by editors are automatically published
      },
      select: {
        id: true,
        title: true,
        description: true,
        publishDate: true,
        editionNumber: true,
        isPublished: true,
      },
    })

    console.log('✅ Edition created successfully:', {
      id: edition.id,
      title: edition.title,
      editionNumber: edition.editionNumber,
      isPublished: edition.isPublished
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
