import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkArticleContentSample() {
  try {
    const article = await prisma.article.findFirst({
      where: {
        title: 'The Transition to EVs and Implications'
      },
      select: {
        title: true,
        content: true,
      }
    })

    if (article) {
      // console.log(`Title: ${article.title}`)
      // console.log(`Content preview (first 500 chars):`)
      // console.log(article.content?.substring(0, 500))
      // console.log('\n...')
    }

  } catch (error) {
    // console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkArticleContentSample()
