import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createPusakaComUsers() {
  try {
    console.log('🚀 Creating @pusaka.com test users...')
    
    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@pusaka.com',
        password: 'admin123',
        role: 'ADMIN' as const,
      },
      {
        name: 'Editor User', 
        email: 'editor@pusaka.com',
        password: 'editor123',
        role: 'EDITOR' as const,
      },
      {
        name: 'Publisher User',
        email: 'publisher@pusaka.com', 
        password: 'publisher123',
        role: 'PUBLISHER' as const,
      }
    ]
    
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          name: userData.name,
          password: hashedPassword,
          role: userData.role,
          isActive: true,
          isVerified: true,
        },
        create: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          subscriptionType: 'ANNUALLY',
          subscriptionStart: new Date(),
          subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: true,
          isVerified: true,
        }
      })
      
      console.log(`✅ Created/Updated: ${user.email} (${user.role})`)
      console.log(`   🔑 Password: ${userData.password}`)
    }
    
    console.log('\n🎯 @pusaka.com users ready for testing!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createPusakaComUsers()
