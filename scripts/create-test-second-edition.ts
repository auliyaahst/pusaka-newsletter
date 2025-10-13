import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSecondEdition() {
  try {
    // Check if we already have multiple editions
    const existingEditions = await prisma.edition.findMany()
    
    if (existingEditions.length > 1) {
      // console.log('✅ Multiple editions already exist:')
      // existingEditions.forEach((edition, index) => {
      //   console.log(`${index + 1}. ${edition.title} ${edition.editionNumber ? `(#${edition.editionNumber})` : ''} - ${edition.isPublished ? 'Published' : 'Draft'}`)
      // })
      return
    }

    const edition = await prisma.edition.create({
      data: {
        title: 'SUSTAINABLE ENERGY FUTURE',
        description: 'Exploring renewable energy sources and their impact on our planet.',
        publishDate: new Date('2024-10-15'),
        editionNumber: 2,
        theme: 'Environment & Technology',
        isPublished: true, // Published so it shows up
      },
    })

    // console.log('✅ Second edition created successfully:')
    // console.log(`- ID: ${edition.id}`)
    // console.log(`- Title: ${edition.title}`)
    // console.log(`- Edition Number: ${edition.editionNumber}`)
    // console.log(`- Published: ${edition.isPublished}`)
    // console.log(`- Publish Date: ${edition.publishDate}`)
    // console.log('\n📰 Now you can test the edition navigation on the dashboard!')
  } catch (error) {
    // console.error('❌ Error creating edition:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSecondEdition()
