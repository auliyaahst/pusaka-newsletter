import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProductionData() {
  try {
    console.log('=== PRODUCTION DATABASE CHECK ===\n')
    
    // Check environment
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    console.log('Current environment:', process.env.NODE_ENV || 'development')
    console.log('')
    
    // 1. Check all users
    console.log('1. ALL USERS:')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        _count: {
          select: {
            articles: true
          }
        }
      }
    })
    
    console.log(`   Total users: ${users.length}`)
    for (const user of users) {
      console.log(`   - ${user.name} (${user.email})`)
      console.log(`     Role: ${user.role}, Active: ${user.isActive}`)
      console.log(`     Articles: ${user._count.articles}`)
      console.log(`     ID: ${user.id}`)
      console.log('')
    }
    
    // 2. Check editor users specifically
    console.log('2. EDITOR USERS ONLY:')
    const editorUsers = await prisma.user.findMany({
      where: {
        role: 'EDITOR'
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        _count: {
          select: {
            articles: true
          }
        }
      }
    })
    
    console.log(`   Editor users found: ${editorUsers.length}`)
    for (const editor of editorUsers) {
      console.log(`   - ${editor.name} (${editor.email})`)
      console.log(`     Active: ${editor.isActive}`)
      console.log(`     Articles: ${editor._count.articles}`)
      console.log(`     ID: ${editor.id}`)
      console.log('')
    }
    
    // 3. Check all articles
    console.log('3. ALL ARTICLES:')
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        authorId: true,
        author: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`   Total articles: ${articles.length}`)
    if (articles.length === 0) {
      console.log('   ❌ NO ARTICLES FOUND - This explains why the dashboard is empty!')
    } else {
      for (const article of articles) {
        console.log(`   - "${article.title}"`)
        if (article.author) {
          console.log(`     Author: ${article.author.name} (${article.author.email}) - ${article.author.role}`)
        } else {
          console.log(`     Author: [No author data]`)
        }
        console.log(`     Status: ${article.status}`)
        console.log(`     Created: ${article.createdAt}`)
        console.log('')
      }
    }
    
    // 4. Check editions
    console.log('4. EDITIONS:')
    const editions = await prisma.edition.findMany({
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
    
    console.log(`   Total editions: ${editions.length}`)
    for (const edition of editions) {
      console.log(`   - "${edition.title}"`)
      console.log(`     Published: ${edition.isPublished}`)
      console.log(`     Articles: ${edition._count.articles}`)
      console.log('')
    }
    
    console.log('=== ANALYSIS ===')
    if (articles.length === 0) {
      console.log('🔍 DIAGNOSIS: No articles found in production database.')
      console.log('📋 SOLUTIONS:')
      console.log('   1. Run data migration/seeding scripts on production')
      console.log('   2. Copy data from local database to production')
      console.log('   3. Create new articles directly on production')
    } else if (editorUsers.length === 0) {
      console.log('🔍 DIAGNOSIS: No editor users found in production database.')
      console.log('📋 SOLUTION: Create editor users on production')
    } else {
      console.log('🔍 DIAGNOSIS: Data exists but may not match user session')
      console.log('📋 CHECK: Verify which user account you are logged in as')
    }
    
  } catch (error) {
    console.error('❌ Error checking production data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductionData()
