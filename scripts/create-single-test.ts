import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createSingleTestUser() {
  try {
    console.log('🚀 Creating single test user...')
    
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const user = await prisma.user.upsert({
      where: { email: 'admin@pusaka.com' },
      update: {
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        isVerified: true,
      },
      create: {
        name: 'Admin User',
        email: 'admin@pusaka.com',
        password: hashedPassword,
        role: 'ADMIN',
        subscriptionType: 'ANNUALLY',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
        isVerified: true,
      }
    })
    
    console.log('✅ Admin user created/updated:', user.email)
    console.log('📧 Email: admin@pusaka.com')
    console.log('🔑 Password: admin123')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSingleTestUser()
