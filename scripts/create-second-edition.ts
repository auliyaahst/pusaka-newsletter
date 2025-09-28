import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSecondEdition() {
  try {
    const edition = await prisma.edition.create({
      data: {
        title: 'Future of Renewable Energy',
        description: 'Exploring the latest developments in solar, wind, and other renewable energy technologies.',
        publishDate: new Date('2024-09-30'),
        editionNumber: 2,
        theme: 'Environment & Technology',
        isPublished: false, // Start as draft
      },
    })

    console.log('✅ Second edition created successfully:')
    console.log(`- ID: ${edition.id}`)
    console.log(`- Title: ${edition.title}`)
    console.log(`- Edition Number: ${edition.editionNumber}`)
    console.log(`- Published: ${edition.isPublished}`)
    console.log(`- Publish Date: ${edition.publishDate}`)
  } catch (error) {
    console.error('❌ Error creating edition:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSecondEdition()
