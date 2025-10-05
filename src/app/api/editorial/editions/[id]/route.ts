import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

// GET specific edition
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const edition = await prisma.edition.findUnique({
      where: { id },
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
  } finally {
    await prisma.$disconnect()
  }
}

// PATCH update edition (including publish/unpublish)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const session = await getServerSession(authOptions)
    
    // if (!session?.user?.email) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    // }

    const { id } = await params
    const body = await request.json()

    // Check if edition exists
    const existingEdition = await prisma.edition.findUnique({
      where: { id }
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
      where: { id },
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
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE edition
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const session = await getServerSession(authOptions)
    
    // if (!session?.user?.email) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    // }

    const { id } = await params

    // Check if edition exists
    const existingEdition = await prisma.edition.findUnique({
      where: { id }
    })

    if (!existingEdition) {
      return NextResponse.json({ message: 'Edition not found' }, { status: 404 })
    }

    // Delete related articles first (if needed)
    await prisma.article.deleteMany({
      where: { editionId: id }
    })

    // Delete the edition
    await prisma.edition.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Edition deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting edition:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}