import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createThirdEdition() {
  try {
    const edition = await prisma.edition.create({
      data: {
        title: 'AI and Machine Learning Revolution',
        description: 'Exploring how artificial intelligence and machine learning are transforming industries and daily life.',
        publishDate: new Date('2024-10-15'),
        editionNumber: 3,
        theme: 'Technology & Innovation',
        isPublished: false, // Start as draft
      },
    })

    console.log('✅ Third edition created successfully:')
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

createThirdEdition()
