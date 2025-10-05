import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET specific edition
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params

    const edition = await prisma.edition.findUnique({
      where: { id: resolvedParams.id },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    })

    if (!edition) {
      return NextResponse.json({ message: 'Edition not found' }, { status: 404 })
    }

    return NextResponse.json({ edition })
  } catch (error) {
    console.error('Error fetching edition:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update edition (full update for publisher)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Publishers and editors can update editions
    if (!['PUBLISHER', 'EDITOR'].includes(session.user.role || '')) {
      return NextResponse.json(
        { error: 'Forbidden - Publisher access required' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Check if edition exists
    const existingEdition = await prisma.edition.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingEdition) {
      return NextResponse.json({ message: 'Edition not found' }, { status: 404 })
    }

    // Prepare update data with proper date formatting
    const updateData: any = {
      ...body,
      updatedAt: new Date()
    }

    // Convert publishDate to ISO DateTime if provided
    if (body.publishDate) {
      updateData.publishDate = new Date(body.publishDate + 'T00:00:00.000Z').toISOString()
    }

    // Update the edition with provided data
    const updatedEdition = await prisma.edition.update({
      where: { id: resolvedParams.id },
      data: updateData,
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Edition updated successfully',
      edition: updatedEdition
    })
  } catch (error) {
    console.error('Error updating edition:', error)
    return NextResponse.json(
      { error: 'Failed to update edition' },
      { status: 500 }
    )
  }
}

// PATCH update edition (partial update, including publish/unpublish)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Publishers and editors can update editions
    if (!['PUBLISHER', 'EDITOR'].includes(session.user.role || '')) {
      return NextResponse.json(
        { error: 'Forbidden - Publisher access required' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Check if edition exists
    const existingEdition = await prisma.edition.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingEdition) {
      return NextResponse.json({ message: 'Edition not found' }, { status: 404 })
    }

    // Prepare update data with proper date formatting
    const updateData: any = {
      ...body,
      updatedAt: new Date()
    }

    // Convert publishDate to ISO DateTime if provided
    if (body.publishDate) {
      updateData.publishDate = new Date(body.publishDate + 'T00:00:00.000Z').toISOString()
    }

    const edition = await prisma.edition.update({
      where: { id: resolvedParams.id },
      data: updateData,
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

    return NextResponse.json({
      message: 'Edition updated successfully',
      edition
    })
  } catch (error) {
    console.error('Error updating edition:', error)
    return NextResponse.json(
      { error: 'Failed to update edition' },
      { status: 500 }
    )
  }
}

// DELETE edition
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Publishers and editors can delete editions
    if (!['PUBLISHER', 'EDITOR'].includes(session.user.role || '')) {
      return NextResponse.json(
        { error: 'Forbidden - Publisher access required' },
        { status: 403 }
      )
    }

    // Check if edition exists
    const existingEdition = await prisma.edition.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingEdition) {
      return NextResponse.json({ message: 'Edition not found' }, { status: 404 })
    }

    // Delete related articles first (if needed)
    await prisma.article.deleteMany({
      where: { editionId: resolvedParams.id }
    })

    // Delete the edition
    await prisma.edition.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      message: 'Edition deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting edition:', error)
    return NextResponse.json(
      { error: 'Failed to delete edition' },
      { status: 500 }
    )
  }
}