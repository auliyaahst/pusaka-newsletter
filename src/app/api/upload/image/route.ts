import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || !['EDITOR', 'PUBLISHER', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Editor/Publisher access required' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    const articleId = formData.get('articleId') as string // Optional: if we know which article this is for
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')
    
    // Get image dimensions if possible (optional)
    let width = null
    let height = null
    
    // Create image record in database
    const savedImage = await prisma.image.create({
      data: {
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        data: base64Data,
        width: width,
        height: height,
        uploaderId: session.user.id,
        articleId: articleId || null, // Link to article if provided
      }
    })
    
    // Return the database image URL
    const imageUrl = `/api/images/${savedImage.id}`
    
    return NextResponse.json({
      success: true,
      url: imageUrl,
      imageId: savedImage.id,
      filename: savedImage.filename
    })
    
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
