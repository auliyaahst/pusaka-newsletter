import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmailVerification, generateVerificationToken } from '@/lib/emailVerification'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If already verified, no need to send verification email
    if (user.isVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 200 }
      )
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken()
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with new token
    await prisma.user.update({
      where: { email },
      data: {
        otpCode: verificationToken,
        otpExpiry: tokenExpiry
      }
    })

    // Send verification email
    const emailResult = await sendEmailVerification(email, verificationToken)
    
    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Verification email sent successfully',
        success: true
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { error: 'An error occurred while sending verification email' },
      { status: 500 }
    )
  }
}
