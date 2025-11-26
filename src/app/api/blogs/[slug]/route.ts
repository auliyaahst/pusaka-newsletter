import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient, BlogStatus } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const blog = await prisma.blog.findUnique({
      where: {
        slug: slug
      },
      include: {
        author: {
          select: {
            name: true
          }
        }
      }
    })

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    // Only show published blogs to regular users, allow editors/admins to see all
    const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'EDITOR']
    if (blog.status !== 'PUBLISHED' && (!session.user?.role || !allowedRoles.includes(session.user.role))) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    return NextResponse.json({ blog })
  } catch (error) {
    console.error('Error fetching blog:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { slug } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to edit blogs
    const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'EDITOR']
    if (!session.user.role || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      title, 
      content, 
      excerpt, 
      slug: newSlug, 
      status, 
      metaTitle, 
      metaDescription, 
      featuredImage,
      tags,
      readTime 
    } = body

    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { slug: slug }
    })

    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    // If changing slug, check if new slug is available
    if (newSlug && newSlug !== slug) {
      const slugExists = await prisma.blog.findUnique({
        where: { slug: newSlug }
      })

      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }
    }

    const updateData: {
      title?: string;
      content?: string;
      excerpt?: string | null;
      slug?: string;
      status?: BlogStatus;
      publishedAt?: Date | null;
      metaTitle?: string | null;
      metaDescription?: string | null;
      featuredImage?: string | null;
      tags?: string[];
      readTime?: number | null;
    } = {}
    if (title) updateData.title = title
    if (content) updateData.content = content
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (newSlug) updateData.slug = newSlug
    if (status) {
      updateData.status = status
      if (status === 'PUBLISHED' && !existingBlog.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage
    if (tags !== undefined) updateData.tags = tags
    if (readTime !== undefined) updateData.readTime = readTime

    const blog = await prisma.blog.update({
      where: { slug: slug },
      data: updateData,
      include: {
        author: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({ blog })
  } catch (error) {
    console.error('Error updating blog:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { slug } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to delete blogs
    const allowedRoles = ['ADMIN', 'SUPER_ADMIN']
    if (!session.user.role || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const existingBlog = await prisma.blog.findUnique({
      where: { slug: slug }
    })

    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    await prisma.blog.delete({
      where: { slug: slug }
    })

    return NextResponse.json({ message: 'Blog deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
