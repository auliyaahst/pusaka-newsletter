import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOTPEmail, generateOTP } from '@/lib/email'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, type, password } = await request.json()

    console.log('🔧 Send OTP API called:', { 
      email, 
      type, 
      hasPassword: !!password,
      timestamp: new Date().toISOString()
    })

    if (!email || !type) {
      console.log('❌ Missing required fields')
      return NextResponse.json({ error: 'Email and type are required' }, { status: 400 })
    }

    // Exclude specific admin/staff emails from OTP verification
    const excludedEmails = ['admin@pusaka.com', 'editor@pusaka.com', 'publisher@pusaka.com']
    
    if (excludedEmails.includes(email)) {
      console.log('🔓 Admin/staff email - skipping OTP:', email)
      return NextResponse.json({ 
        success: true, 
        message: 'OTP verification skipped for admin/staff accounts',
        skipOTP: true 
      })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (type === 'register') {
      // For register type, user should already exist (created by register API)
      if (!existingUser) {
        console.log('❌ User not found for registration:', email)
        return NextResponse.json({ error: 'User not found. Please register first.' }, { status: 400 })
      }
      // No password verification needed for registration email verification
    }

    if (type === 'login') {
      if (!existingUser) {
        console.log('❌ User not found for login:', email)
        return NextResponse.json({ error: 'User not found' }, { status: 400 })
      }
      if (!password) {
        console.log('❌ Missing password for login')
        return NextResponse.json({ error: 'Password is required' }, { status: 400 })
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, existingUser.password || '')
      if (!isValidPassword) {
        console.log('❌ Invalid password for login:', email)
        return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
      }
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 1 * 60 * 1000) // 1 minute

    console.log('🔑 Generated OTP for', email, '- Code:', otp, '- Expires:', otpExpiry.toISOString())

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

    console.log('📧 Attempting to send email to:', email)

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, type)
    
    console.log('📬 Email send result:', emailResult)
    
    if (!emailResult.success) {
      console.log('❌ Email sending failed:', emailResult.error)
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
