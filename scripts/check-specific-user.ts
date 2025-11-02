import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSpecificUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'ahnyjn193@gmail.com' },
      select: { 
        id: true,
        name: true, 
        email: true, 
        role: true, 
        isActive: true, 
        isVerified: true,
        password: true,
        emailVerified: true,
        image: true,
        createdAt: true
      }
    })

    if (user) {
      console.log('✅ User ahnyjn193@gmail.com found:')
      console.log({
        ...user,
        password: user.password ? 'SET (length: ' + user.password.length + ')' : 'NULL',
        createdAt: user.createdAt.toISOString()
      })
      
      // Check if this looks like a Google OAuth user
      if (!user.password && user.image) {
        console.log('🔍 This appears to be a Google OAuth user (has image, no password)')
      }
    } else {
      console.log('❌ User ahnyjn193@gmail.com not found')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSpecificUser()
