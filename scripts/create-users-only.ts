import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createUsersOnly() {
  try {
    console.log('Creating users only...')
    
    const testUsers = [
      {
        id: 'admin-user-1',
        name: 'Admin User',
        email: 'admin@pusaka.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'ADMIN' as const,
        subscriptionType: 'ANNUALLY' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        trialUsed: false,
      },
      {
        id: 'publisher-user-1',
        name: 'John Publisher',
        email: 'publisher@pusaka.com',
        password: await bcrypt.hash('publisher123', 12),
        role: 'PUBLISHER' as const,
        subscriptionType: 'QUARTERLY' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
        isActive: true,
        trialUsed: false,
      },
      {
        id: 'editor-user-1',
        name: 'Jane Editor',
        email: 'editor@pusaka.com',
        password: await bcrypt.hash('editor123', 12),
        role: 'EDITOR' as const,
        subscriptionType: 'MONTHLY' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
        isActive: true,
        trialUsed: false,
      },
      {
        id: 'customer-user-1',
        name: 'Alice Customer',
        email: 'customer@pusaka.com',
        password: await bcrypt.hash('customer123', 12),
        role: 'CUSTOMER' as const,
        subscriptionType: 'FREE_TRIAL' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: true,
        trialUsed: false,
      },
      {
        id: 'test-user-1',
        name: 'Test User',
        email: 'test@pusaka.com',
        password: await bcrypt.hash('test123', 12),
        role: 'CUSTOMER' as const,
        subscriptionType: 'FREE_TRIAL' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: false,
        trialUsed: true,
      },
    ]

    for (const userData of testUsers) {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData,
      })
    }

    console.log(`Created ${testUsers.length} test users`)
    console.log('✅ Users created successfully!')
    
    // Verify the database state
    const userCount = await prisma.user.count()
    const articleCount = await prisma.article.count()
    const editionCount = await prisma.edition.count()
    
    console.log('\n📊 Database Status:')
    console.log(`👥 Users: ${userCount}`)
    console.log(`📝 Articles: ${articleCount}`)
    console.log(`📰 Editions: ${editionCount}`)
    
  } catch (error) {
    console.error('Error creating users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUsersOnly()
