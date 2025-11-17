import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOTPEmail, generateOTP } from '@/lib/email'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  console.log('🔐 POST /api/auth/send-otp - OTP request received')
  
  try {
    const { email, type, password } = await request.json()
    console.log('📧 OTP request for:', { email, type, hasPassword: !!password })

    if (!email || !type) {
      console.log('❌ Missing required fields:', { email: !!email, type: !!type })
      return NextResponse.json({ error: 'Email and type are required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    console.log('👤 User lookup result:', { 
      email, 
      userExists: !!existingUser, 
      userId: existingUser?.id,
      userRole: existingUser?.role,
      isVerified: existingUser?.isVerified,
      isActive: existingUser?.isActive
    })

    if (type === 'register') {
      console.log('📝 Register type - checking user existence')
      // For register type, user should already exist (created by register API)
      if (!existingUser) {
        console.log('❌ Register failed - User not found, need to register first')
        return NextResponse.json({ error: 'User not found. Please register first.' }, { status: 400 })
      }
      console.log('✅ Register type - User exists, proceeding with OTP')
      // No password verification needed for registration email verification
    }

    if (type === 'login') {
      console.log('🔑 Login type - validating user and password')
      if (!existingUser) {
        console.log('❌ Login failed - User not found')
        return NextResponse.json({ error: 'User not found' }, { status: 400 })
      }
      if (!password) {
        console.log('❌ Login failed - Password not provided')
        return NextResponse.json({ error: 'Password is required' }, { status: 400 })
      }
      
      // Check if user has a password set
      if (!existingUser.password) {
        console.log('❌ Login failed - No password set for account')
        return NextResponse.json({ error: 'No password set for this account. Please use Google sign-in or reset your password.' }, { status: 400 })
      }
      
      console.log('🔍 Verifying password...')
      // Verify password
      const isValidPassword = await bcrypt.compare(password, existingUser.password)
      if (!isValidPassword) {
        console.log('❌ Login failed - Invalid password')
        return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
      }
      console.log('✅ Password verified successfully')

      // Skip OTP for @pusaka.com emails
      if (email.endsWith('@pusaka.com')) {
        console.log('🚀 Skipping OTP for @pusaka.com email:', email)
        return NextResponse.json({ 
          success: true, 
          skipOTP: true,
          message: 'OTP skipped for @pusaka.com domain',
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role
          }
        })
      }
      console.log('📱 Regular email - OTP required, proceeding with OTP generation')
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    console.log('🔢 Generated OTP:', otp, 'Expires at:', otpExpiry.toISOString())

    if (type === 'register') {
      console.log('💾 Updating user with OTP for registration...')
      // Update existing user with OTP (user was just created by register API)
      await prisma.user.update({
        where: { email },
        data: {
          otpCode: otp,
          otpExpiry
        }
      })
    } else {
      console.log('💾 Updating user with OTP for login...')
      // Update existing user with OTP for login
      await prisma.user.update({
        where: { email },
        data: {
          otpCode: otp,
          otpExpiry
        }
      })
    }

    console.log('📧 Sending OTP email...')
    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, type)
    
    if (!emailResult.success) {
      console.log('❌ Failed to send OTP email')
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 })
    }

    console.log('✅ OTP sent successfully to:', email)
    return NextResponse.json({ 
      success: true, 
      message: `OTP sent to ${email}`,
      expiresAt: otpExpiry.toISOString()
    })

  } catch (error) {
    console.error('💥 Send OTP error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
