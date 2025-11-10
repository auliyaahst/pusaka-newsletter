import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugUserSession() {
  try {
    console.log('=== DEBUGGING USER SESSION ISSUE ===\n')
    
    // Get the user that should have articles
    const editorUser = await prisma.user.findUnique({
      where: { email: 'editor@pusaka.com' },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })
    
    if (!editorUser) {
      console.log('❌ Editor user not found!')
      return
    }
    
    console.log('✅ EDITOR USER FOUND:')
    console.log(`   Name: ${editorUser.name}`)
    console.log(`   Email: ${editorUser.email}`)
    console.log(`   ID: ${editorUser.id}`)
    console.log(`   Role: ${editorUser.role}`)
    console.log(`   Active: ${editorUser.isActive}`)
    console.log(`   Verified: ${editorUser.isVerified}`)
    console.log('')
    
    console.log('📝 ARTICLES FOR THIS USER:')
    console.log(`   Total: ${editorUser.articles.length}`)
    
    for (const article of editorUser.articles) {
      console.log(`   - "${article.title}"`)
      console.log(`     Status: ${article.status}`)
      console.log(`     ID: ${article.id}`)
      console.log(`     Created: ${article.createdAt}`)
      console.log('')
    }
    
    // Test the exact same query that the API uses
    console.log('🔍 TESTING API QUERY:')
    const apiQuery = await prisma.article.findMany({
      where: {
        authorId: editorUser.id,
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        edition: {
          select: {
            id: true,
            title: true,
            publishDate: true,
          },
        },
      },
    })
    
    console.log(`   API query returned: ${apiQuery.length} articles`)
    
    if (apiQuery.length > 0) {
      console.log('   ✅ API query works correctly!')
      console.log('   🔍 This means the issue is likely with:')
      console.log('      - Session authentication on frontend')
      console.log('      - NextAuth session not matching user ID')
      console.log('      - Browser cache/cookies issue')
      console.log('')
      
      console.log('   📋 TROUBLESHOOTING STEPS:')
      console.log('   1. Clear browser cache and cookies for dev.thepusaka.id')
      console.log('   2. Use private/incognito browser window')
      console.log('   3. Check browser developer tools Network tab for /api/editorial/articles response')
      console.log('   4. Verify the session user ID matches the expected user ID')
    } else {
      console.log('   ❌ API query returned 0 results - this is unexpected!')
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugUserSession()
