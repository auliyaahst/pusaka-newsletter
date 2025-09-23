import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAllDataExceptUsers() {
  try {
    console.log('Starting database cleanup (keeping users)...')
    
    // Delete in order to respect foreign key constraints
    
    // 1. Delete review notes first (has foreign keys to articles and users)
    const deletedReviewNotes = await prisma.reviewNote.deleteMany({})
    console.log(`✓ Deleted ${deletedReviewNotes.count} review notes`)
    
    // 2. Delete articles (has foreign keys to editions and users)
    const deletedArticles = await prisma.article.deleteMany({})
    console.log(`✓ Deleted ${deletedArticles.count} articles`)
    
    // 3. Delete editions
    const deletedEditions = await prisma.edition.deleteMany({})
    console.log(`✓ Deleted ${deletedEditions.count} editions`)
    
    // 4. Delete payments (has foreign key to users, but we keep users)
    const deletedPayments = await prisma.payment.deleteMany({})
    console.log(`✓ Deleted ${deletedPayments.count} payments`)
    
    // 5. Delete accounts (NextAuth accounts, has foreign key to users)
    const deletedAccounts = await prisma.account.deleteMany({})
    console.log(`✓ Deleted ${deletedAccounts.count} accounts`)
    
    // 6. Delete sessions (NextAuth sessions, has foreign key to users)
    const deletedSessions = await prisma.session.deleteMany({})
    console.log(`✓ Deleted ${deletedSessions.count} sessions`)
    
    // 7. Delete verification tokens (NextAuth)
    const deletedVerificationTokens = await prisma.verificationToken.deleteMany({})
    console.log(`✓ Deleted ${deletedVerificationTokens.count} verification tokens`)
    
    // Check remaining users
    const remainingUsers = await prisma.user.count()
    console.log(`✓ Kept ${remainingUsers} users`)
    
    console.log('\n🎉 Database cleanup completed successfully!')
    console.log('📋 Summary:')
    console.log(`   - Users preserved: ${remainingUsers}`)
    console.log(`   - All other data deleted`)
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllDataExceptUsers()
