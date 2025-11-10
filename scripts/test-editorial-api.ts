import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testEditorialAPI() {
  try {
    console.log('=== TESTING EDITORIAL API SIMULATION ===\n')
    
    // Test for editor@pusaka.com user (the one with articles)
    const editorUserId = 'cmhhosfj40001t6yuan94kzng' // Editor User ID from debug
    
    console.log('1. Testing API for editor@pusaka.com')
    console.log(`   User ID: ${editorUserId}`)
    
    const editorArticles = await prisma.article.findMany({
      where: {
        authorId: editorUserId,
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
    
    console.log(`   Found ${editorArticles.length} articles:`)
    for (const article of editorArticles) {
      console.log(`     - "${article.title}" (${article.status})`)
      if (article.edition) {
        console.log(`       Edition: "${article.edition.title}"`)
      }
    }
    
    // Test for it.editor@thepusaka.id user (the one with 0 articles)
    const itEditorUserId = 'cmhngg2px0000psi4nf5bfxhg' // IT Editor ID from debug
    
    console.log(`\n2. Testing API for it.editor@thepusaka.id`)
    console.log(`   User ID: ${itEditorUserId}`)
    
    const itEditorArticles = await prisma.article.findMany({
      where: {
        authorId: itEditorUserId,
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
    
    console.log(`   Found ${itEditorArticles.length} articles:`)
    for (const article of itEditorArticles) {
      console.log(`     - "${article.title}" (${article.status})`)
    }
    
    if (itEditorArticles.length === 0) {
      console.log('     (No articles - this explains why the dashboard is empty if you\'re logged in as this user)')
    }
    
    console.log('\n=== TEST COMPLETE ===')
    console.log('\nCONCLUSION:')
    console.log('If you are logged in as it.editor@thepusaka.id on dev.thepusaka.id,')
    console.log('that would explain why you see no articles in the article management.')
    console.log('Try logging in as editor@pusaka.com instead to see the 9 existing articles.')
    
  } catch (error) {
    console.error('Error during test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEditorialAPI()
