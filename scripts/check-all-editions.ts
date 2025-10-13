import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAllEditions() {
  try {
    const editions = await prisma.edition.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // console.log('\nALL Editions (including drafts):')
    // editions.forEach((edition, index) => {
    //   console.log(`${index + 1}. ${edition.title}`)
    //   console.log(`   - ID: ${edition.id}`)
    //   console.log(`   - Edition Number: ${edition.editionNumber}`)
    //   console.log(`   - Status: ${edition.isPublished ? 'PUBLISHED' : 'DRAFT'}`)
    //   console.log(`   - Created: ${edition.createdAt}`)
    //   console.log('')
    // })

  } catch (error) {
    // console.error('Error checking editions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllEditions()
