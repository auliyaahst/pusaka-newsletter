import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const blogs = await prisma.blog.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        author: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      }
    })

    return NextResponse.json({ blogs })
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to create blogs (ADMIN, SUPER_ADMIN, EDITOR)
    const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'EDITOR']
    if (!session.user.role || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      title, 
      content, 
      excerpt, 
      slug, 
      status = 'DRAFT', 
      metaTitle, 
      metaDescription, 
      featuredImage,
      tags = [],
      readTime 
    } = body

    // Validate required fields
    if (!title || !content || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if slug already exists
    const existingBlog = await prisma.blog.findUnique({
      where: { slug }
    })

    if (existingBlog) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        excerpt,
        slug,
        status,
        metaTitle,
        metaDescription,
        featuredImage,
        tags,
        readTime,
        authorId: session.user.id,
        publishedAt: status === 'PUBLISHED' ? new Date() : null
      },
      include: {
        author: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({ blog }, { status: 201 })
  } catch (error) {
    console.error('Error creating blog:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
