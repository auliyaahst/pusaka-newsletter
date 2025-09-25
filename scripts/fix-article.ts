import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixArticleEdition() {
  try {
    console.log('🔧 Fixing Article Edition Association:')
    console.log('=' .repeat(40))
    
    // Get the published article without edition
    const article = await prisma.article.findFirst({
      where: { 
        status: 'PUBLISHED',
        editionId: null 
      }
    })
    
    // Get the published edition
    const edition = await prisma.edition.findFirst({
      where: { isPublished: true }
    })
    
    if (!article || !edition) {
      console.log('❌ Article or edition not found')
      return
    }
    
    console.log(`📝 Article: ${article.title}`)
    console.log(`📰 Edition: ${edition.title}`)
    
    // Update the article to belong to the edition
    const updatedArticle = await prisma.article.update({
      where: { id: article.id },
      data: { editionId: edition.id },
      include: {
        edition: true
      }
    })
    
    console.log('✅ Article updated successfully!')
    console.log(`📝 Article "${updatedArticle.title}" is now part of edition "${updatedArticle.edition?.title}"`)
    
    // Verify the fix by running the API query again
    console.log('\n🔍 Verifying Fix - Testing API Query:')
    const apiResult = await prisma.edition.findMany({
      where: {
        isPublished: true,
      },
      include: {
        articles: {
          where: {
            status: 'PUBLISHED',
          },
          select: {
            id: true,
            title: true,
            excerpt: true,
            slug: true,
          },
        },
        _count: {
          select: {
            articles: {
              where: {
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
    })
    
    console.log('✅ API Result after fix:')
    apiResult.forEach(edition => {
      console.log(`📰 Edition: ${edition.title}`)
      console.log(`  Articles count: ${edition._count.articles}`)
      edition.articles.forEach(art => {
        console.log(`  📝 Article: ${art.title}`)
      })
    })
    
  } catch (error) {
    console.error('❌ Error fixing article:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixArticleEdition()
