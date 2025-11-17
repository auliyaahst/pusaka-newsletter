import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?error=invalid-verification`)
    }

    // Find user with matching email and verification token
    const user = await prisma.user.findFirst({
      where: {
        email: decodeURIComponent(email),
        otpCode: token, // Reuse otpCode field for verification token
        otpExpiry: {
          gte: new Date() // Token not expired (24 hours)
        }
      }
    })

    if (!user) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?error=invalid-or-expired`)
    }

    // Mark user as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiry: null
      }
    })

    // Redirect to login with success message
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?verified=true`)

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?error=verification-failed`)
  }
}
