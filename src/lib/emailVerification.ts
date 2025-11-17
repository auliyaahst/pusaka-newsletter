import nodemailer from 'nodemailer'

// Reuse the existing transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

// Generate verification token
export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Send simple email verification (no OTP code)
export async function sendEmailVerification(email: string, token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${token}&email=${encodeURIComponent(email)}`
    
    const mailOptions = {
      from: {
        name: 'The Pusaka Newsletter',
        address: process.env.GMAIL_USER || ''
      },
      to: email,
      subject: 'Verify Your Email - The Pusaka Newsletter',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #1e3a8a; margin: 0; font-size: 28px; font-weight: bold;">
                The Pusaka Newsletter
              </h1>
              <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">
                Welcome to our community!
              </p>
            </div>

            <!-- Main Content -->
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
                Verify Your Email Address
              </h2>
              
              <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                Thank you for joining The Pusaka Newsletter! Please click the button below to verify your email address and activate your account.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background-color: #1e3a8a; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                  Verify Email Address
                </a>
              </div>

              <p style="color: #6b7280; margin: 20px 0 0 0; font-size: 14px; line-height: 1.5;">
                If the button doesn't work, you can copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #3b82f6; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>

            <!-- Security Notice -->
            <div style="border-left: 4px solid #fbbf24; background-color: #fffbeb; padding: 20px; margin-bottom: 30px;">
              <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>Security Notice:</strong> This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; color: #9ca3af; font-size: 14px;">
              <p style="margin: 0;">© 2025 The Pusaka Newsletter. All rights reserved.</p>
              <p style="margin: 10px 0 0 0;">This email was sent to ${email}</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Email verification send error:', error)
    return { success: false, error: 'Failed to send verification email' }
  }
}
