import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUsers() {
  try {
    console.log('🚀 Creating test users...')
    
    const testUsers = [
      {
        name: 'John Publisher',
        email: 'publisher@pusaka.com',
        password: 'publisher123',
        role: 'PUBLISHER' as const,
        subscriptionType: 'QUARTERLY' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
        isActive: true,
        isVerified: true,
        trialUsed: false,
      },
      {
        name: 'Jane Editor',
        email: 'editor@pusaka.com',
        password: 'editor123',
        role: 'EDITOR' as const,
        subscriptionType: 'MONTHLY' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
        isActive: true,
        isVerified: true,
        trialUsed: false,
      },
      {
        name: 'Alice Customer',
        email: 'customer@pusaka.com',
        password: 'customer123',
        role: 'CUSTOMER' as const,
        subscriptionType: 'HALF_YEARLY' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        isActive: true,
        isVerified: true,
        trialUsed: false,
      },
      {
        name: 'Admin User',
        email: 'admin@pusaka.com',
        password: 'admin123',
        role: 'ADMIN' as const,
        subscriptionType: 'ANNUALLY' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        isVerified: true,
        trialUsed: false,
      },
      {
        name: 'Bob Test',
        email: 'trial@pusaka.com',
        password: 'trial123',
        role: 'CUSTOMER' as const,
        subscriptionType: 'FREE_TRIAL' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        isActive: true,
        isVerified: true,
        trialUsed: false,
      },
    ]
    for (const userData of testUsers) {
      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 12)
        
        // Remove password from userData and add the hashed one
        const { password, ...userDataWithoutPassword } = userData
        
        const userWithHashedPassword = {
          ...userDataWithoutPassword,
          password: hashedPassword,
        }
        
        await prisma.user.upsert({
          where: { email: userData.email },
          update: userWithHashedPassword,
          create: userWithHashedPassword,
        })
        console.log(`✅ Created/Updated user: ${userData.email} (${userData.role})`)
      } catch (error) {
        console.log(`❌ Error with user ${userData.email}:`, error instanceof Error ? error.message : error)
      }
    }

    console.log(`\n🎉 Successfully processed ${testUsers.length} test users!`)
    console.log('\n🎯 Test User Credentials:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('👑 SUPER ADMIN:')
    console.log('   📧 Email: superadmin@pusaka.com')
    console.log('   🔑 Password: superadmin123')
    console.log('')
    
    testUsers.forEach(user => {
      console.log(`👤 ${user.role}:`)
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   🔑 Password: ${user.password}`)
      console.log(`   💳 Subscription: ${user.subscriptionType}`)
      console.log('')
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🌟 All users are active and verified!')
    console.log('🚀 Ready for testing all role-based functionality!')
    
  } catch (error) {
    console.error('❌ Error creating test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()
