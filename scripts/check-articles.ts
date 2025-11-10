import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkArticles() {
  try {
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        authorId: true,
        editionId: true,
      }
    })
    
    console.log('Articles in database:', articles.length)
    articles.forEach(article => {
      console.log(`- ID: ${article.id}, Title: ${article.title}, Status: ${article.status}, AuthorId: ${article.authorId}`)
    })
    
    const editions = await prisma.edition.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            articles: true
          }
        }
      }
    })
    
    console.log('\nEditions in database:', editions.length)
    editions.forEach(edition => {
      console.log(`- ID: ${edition.id}, Title: ${edition.title}, Article Count: ${edition._count.articles}`)
    })
    
  } catch (error) {
    console.error('Error checking articles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkArticles()
