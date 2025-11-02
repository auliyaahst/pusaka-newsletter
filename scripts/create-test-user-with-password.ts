import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUserWithPassword() {
  try {
    console.log('🚀 Creating/updating test user with known password...')
    
    const email = 'ahnyjn193@gmail.com'
    const password = 'test123'
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        isActive: true,
        isVerified: true,
      },
      create: {
        name: 'Test User',
        email: email,
        password: hashedPassword,
        role: 'CUSTOMER',
        subscriptionType: 'FREE_TRIAL',
        isActive: true,
        isVerified: true,
      }
    })
    
    console.log('✅ User created/updated successfully')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('👤 User ID:', user.id)
    
    // Test password verification
    const isValid = await bcrypt.compare(password, user.password!)
    console.log('🔍 Password verification test:', isValid ? '✅ VALID' : '❌ INVALID')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUserWithPassword()
