import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSampleArticles() {
  try {
    // Find the "Nickel Downstream" edition
    const nickelEdition = await prisma.edition.findFirst({
      where: { title: 'Nickel Downstream' }
    })

    if (!nickelEdition) {
      console.log('❌ Nickel Downstream edition not found')
      return
    }

    // Check if articles already exist for this edition
    const existingArticles = await prisma.article.findMany({
      where: { editionId: nickelEdition.id }
    })

    if (existingArticles.length > 0) {
      console.log('✅ Articles already exist for Nickel Downstream edition:')
      existingArticles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`)
      })
      return
    }

    // Create sample articles for the Nickel Downstream edition
    const articles = [
      {
        title: 'Indonesia\'s Nickel Mining Expansion',
        content: '<p>Indonesia continues to dominate the global nickel market with significant mining expansions across Sulawesi and other regions.</p>',
        excerpt: 'Exploring Indonesia\'s strategic position in the global nickel supply chain and its impact on the electric vehicle industry.',
        slug: 'indonesia-nickel-mining-expansion',
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        featured: true,
        readTime: 6,
        editionId: nickelEdition.id
      },
      {
        title: 'Nickel Processing Technology Advances',
        content: '<p>Recent technological breakthroughs in nickel processing are revolutionizing the downstream industry.</p>',
        excerpt: 'How new processing technologies are improving efficiency and reducing environmental impact in nickel production.',
        slug: 'nickel-processing-technology-advances',
        status: 'PUBLISHED' as const,
        publishedAt: new Date(),
        featured: false,
        readTime: 4,
        editionId: nickelEdition.id
      }
    ]

    for (const articleData of articles) {
      const article = await prisma.article.create({
        data: articleData
      })
      console.log(`✅ Created article: ${article.title}`)
    }

    console.log(`\n📰 Successfully created ${articles.length} articles for the Nickel Downstream edition!`)
    console.log('Now you can test the edition navigation with content in both editions.')

  } catch (error) {
    console.error('❌ Error creating sample articles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleArticles()
