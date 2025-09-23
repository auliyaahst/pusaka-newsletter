import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fullDatabaseCheck() {
  try {
    console.log('🔍 Full Database Check:')
    console.log('=' .repeat(40))
    
    // Check all tables
    const users = await prisma.user.count()
    const articles = await prisma.article.count()
    const editions = await prisma.edition.count()
    const reviewNotes = await prisma.reviewNote.count()
    const payments = await prisma.payment.count()
    const accounts = await prisma.account.count()
    const sessions = await prisma.session.count()
    const verificationTokens = await prisma.verificationToken.count()
    
    console.log(`👥 Users: ${users}`)
    console.log(`📝 Articles: ${articles}`)
    console.log(`📰 Editions: ${editions}`)
    console.log(`📋 Review Notes: ${reviewNotes}`)
    console.log(`💳 Payments: ${payments}`)
    console.log(`🔐 Accounts: ${accounts}`)
    console.log(`🎫 Sessions: ${sessions}`)
    console.log(`✅ Verification Tokens: ${verificationTokens}`)
    
    // If there are any editions, show them
    if (editions > 0) {
      console.log('\n📰 Found Editions:')
      const editionsList = await prisma.edition.findMany({
        select: {
          id: true,
          title: true,
          isPublished: true,
          _count: {
            select: {
              articles: true
            }
          }
        }
      })
      editionsList.forEach(ed => {
        console.log(`  - ID: ${ed.id}, Title: ${ed.title}, Published: ${ed.isPublished}, Articles: ${ed._count.articles}`)
      })
    }
    
    // If there are any articles, show them
    if (articles > 0) {
      console.log('\n📝 Found Articles:')
      const articlesList = await prisma.article.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          authorId: true,
          editionId: true
        }
      })
      articlesList.forEach(art => {
        console.log(`  - ID: ${art.id}, Title: ${art.title}, Status: ${art.status}, Author: ${art.authorId}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fullDatabaseCheck()
