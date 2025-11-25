import { prisma } from '../src/lib/prisma'

async function debugUserSessions() {
  try {
    console.log('🔍 Checking for user sessions...')
    
    // Find the problematic user
    const problematicUser = await prisma.user.findUnique({
      where: { id: 'cmiei8sns0000t6z904tu1fsc' },
      include: {
        sessions: true,
        accounts: true
      }
    })
    
    console.log('👤 Problematic user:', problematicUser)
    
    // Check all users with the email from the logs
    const usersByEmail = await prisma.user.findMany({
      where: { email: 'blckout26@gmail.com' },
      include: {
        sessions: true,
        accounts: true
      }
    })
    
    console.log('📧 Users with that email:', usersByEmail)
    
    // Count all sessions and accounts
    const sessionCount = await prisma.session.count()
    const accountCount = await prisma.account.count()
    const verificationTokenCount = await prisma.verificationToken.count()
    
    console.log('📊 Current counts:', {
      sessions: sessionCount,
      accounts: accountCount,
      verificationTokens: verificationTokenCount
    })
    
    // If there are any leftover accounts or sessions, clear them
    if (accountCount > 0 || sessionCount > 0) {
      console.log('🧹 Clearing remaining data...')
      await prisma.session.deleteMany({})
      await prisma.account.deleteMany({})
      await prisma.verificationToken.deleteMany({})
      console.log('✅ All cleared')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugUserSessions()
