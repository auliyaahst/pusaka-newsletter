import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkArticleContent() {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        content: true,
      }
    })

    // console.log('\nArticles in database:')
    // articles.forEach((article, index) => {
    //   console.log(`${index + 1}. ${article.title}`)
    //   console.log(`   - ID: ${article.id}`)
    //   console.log(`   - Excerpt length: ${article.excerpt?.length || 0} characters`)
    //   console.log(`   - Excerpt: ${article.excerpt?.substring(0, 200)}${article.excerpt && article.excerpt.length > 200 ? '...' : ''}`)
    //   console.log(`   - Content length: ${article.content?.length || 0} characters`)
    //   console.log('')
    // })

  } catch (error) {
    // console.error('Error checking articles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkArticleContent()
