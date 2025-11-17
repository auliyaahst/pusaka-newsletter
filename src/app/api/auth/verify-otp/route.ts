import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, otp, type } = await request.json()

    if (!email || !otp || !type) {
      return NextResponse.json({ error: 'Email, OTP, and type are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }

    // Check if OTP exists and hasn't expired
    if (!user.otpCode || !user.otpExpiry) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 })
    }

    if (new Date() > user.otpExpiry) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 })
    }

    if (user.otpCode !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    // Clear OTP and mark as verified
    await prisma.user.update({
      where: { email },
      data: {
        otpCode: null,
        otpExpiry: null,
        isVerified: true,
        emailVerified: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'OTP verified successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
