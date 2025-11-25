import { prisma } from '../src/lib/prisma'

async function main() {
  try {
    console.log('🧹 Clearing all NextAuth sessions...')
    
    // Clear all session-related data from NextAuth tables
    const deletedSessions = await prisma.session.deleteMany({})
    const deletedAccounts = await prisma.account.deleteMany({})
    const deletedVerificationTokens = await prisma.verificationToken.deleteMany({})
    
    console.log(`✅ Cleared ${deletedSessions.count} sessions`)
    console.log(`✅ Cleared ${deletedAccounts.count} accounts`)
    console.log(`✅ Cleared ${deletedVerificationTokens.count} verification tokens`)
    
    console.log('🔒 All sessions have been cleared. Users will need to log in again.')
  } catch (error) {
    console.error('❌ Error clearing sessions:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
