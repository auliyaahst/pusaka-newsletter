import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugArticle() {
  try {
    console.log('🔍 Debug Article Data:')
    console.log('=' .repeat(40))
    
    // Get the published article
    const article = await prisma.article.findFirst({
      where: { status: 'PUBLISHED' },
      include: {
        edition: true
      }
    })
    
    if (article) {
      console.log('📝 Found Published Article:')
      console.log(`  Title: ${article.title}`)
      console.log(`  ID: ${article.id}`)
      console.log(`  Status: ${article.status}`)
      console.log(`  EditionId: ${article.editionId}`)
      console.log(`  PublishedAt: ${article.publishedAt}`)
      console.log(`  Edition:`, article.edition)
    } else {
      console.log('❌ No published articles found')
    }
    
    // Check editions
    const editions = await prisma.edition.findMany({
      where: { isPublished: true },
      include: {
        articles: {
          where: { status: 'PUBLISHED' }
        }
      }
    })
    
    console.log('\n📰 Published Editions:')
    editions.forEach(edition => {
      console.log(`  Title: ${edition.title}`)
      console.log(`  ID: ${edition.id}`)
      console.log(`  IsPublished: ${edition.isPublished}`)
      console.log(`  Articles with PUBLISHED status: ${edition.articles.length}`)
      edition.articles.forEach(art => {
        console.log(`    - ${art.title} (${art.status})`)
      })
    })
    
    // Test the API query directly
    console.log('\n🔍 Testing API Query:')
    const apiResult = await prisma.edition.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [
        { publishDate: 'desc' },
      ],
      include: {
        articles: {
          where: {
            status: 'PUBLISHED',
          },
          orderBy: [
            { order: 'asc' },
            { createdAt: 'asc' },
          ],
          select: {
            id: true,
            title: true,
            excerpt: true,
            slug: true,
            featured: true,
            readTime: true,
            publishedAt: true,
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
    
    console.log('API Result:', JSON.stringify(apiResult, null, 2))
    
  } catch (error) {
    console.error('❌ Error debugging article:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugArticle()
