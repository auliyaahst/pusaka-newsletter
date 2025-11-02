import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOTPEmail, generateOTP } from '@/lib/email'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, type, password } = await request.json()

    if (!email || !type) {
      return NextResponse.json({ error: 'Email and type are required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (type === 'register') {
      // For register type, user should already exist (created by register API)
      if (!existingUser) {
        return NextResponse.json({ error: 'User not found. Please register first.' }, { status: 400 })
      }
      // No password verification needed for registration email verification
    }

    if (type === 'login') {
      if (!existingUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 400 })
      }
      if (!password) {
        return NextResponse.json({ error: 'Password is required' }, { status: 400 })
      }
      
      // Check if user has a password set
      if (!existingUser.password) {
        return NextResponse.json({ error: 'No password set for this account. Please use Google sign-in or reset your password.' }, { status: 400 })
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, existingUser.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
      }
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 1 * 60 * 1000) // 1 minute

    if (type === 'register') {
      // Update existing user with OTP (user was just created by register API)
      await prisma.user.update({
        where: { email },
        data: {
          otpCode: otp,
          otpExpiry
        }
      })
    } else {
      // Update existing user with OTP for login
      await prisma.user.update({
        where: { email },
        data: {
          otpCode: otp,
          otpExpiry
        }
      })
    }

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, type)
    
    if (!emailResult.success) {
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `OTP sent to ${email}`,
      expiresAt: otpExpiry.toISOString()
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
