import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const edition = await prisma.edition.findUnique({
      where: { id },
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      where: { id },
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.edition.delete({
      where: { id }
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