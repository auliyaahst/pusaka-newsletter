import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET specific edition
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const edition = await prisma.edition.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    })

    if (!edition) {
      return NextResponse.json(
        { error: 'Edition not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ edition })
  } catch (error) {
    console.error('Error fetching edition:', error)
    return NextResponse.json(
      { error: 'Failed to fetch edition' },
      { status: 500 }
    )
  }
}

// PUT update edition (full update for publisher)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, publishDate, editionNumber, theme, coverImage, isPublished } = body

    const updateData: Record<string, unknown> = {}
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (publishDate !== undefined) updateData.publishDate = new Date(publishDate)
    if (editionNumber !== undefined) updateData.editionNumber = editionNumber
    if (theme !== undefined) updateData.theme = theme
    if (coverImage !== undefined) updateData.coverImage = coverImage
    if (isPublished !== undefined) updateData.isPublished = isPublished

    const edition = await prisma.edition.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: { articles: true }
        }
      }
    })

    return NextResponse.json({ edition })
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, publishDate, editionNumber, theme, coverImage, isPublished } = body

    const updateData: Record<string, unknown> = {}
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (publishDate !== undefined) updateData.publishDate = new Date(publishDate)
    if (editionNumber !== undefined) updateData.editionNumber = editionNumber
    if (theme !== undefined) updateData.theme = theme
    if (coverImage !== undefined) updateData.coverImage = coverImage
    if (isPublished !== undefined) updateData.isPublished = isPublished

    const edition = await prisma.edition.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: { articles: true }
        }
      }
    })

    return NextResponse.json({ edition })
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.edition.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Edition deleted successfully' })
  } catch (error) {
    console.error('Error deleting edition:', error)
    return NextResponse.json(
      { error: 'Failed to delete edition' },
      { status: 500 }
    )
  }
}