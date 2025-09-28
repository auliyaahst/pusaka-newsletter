import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupEditions() {
  try {
    console.log('🧹 Starting edition cleanup...\n')
    
    // First, let's see what we have
    const allEditions = await prisma.edition.findMany({
      select: {
        id: true,
        title: true,
        editionNumber: true,
        isPublished: true,
      },
      orderBy: { editionNumber: 'asc' }
    })

    console.log('📰 Current editions:')
    allEditions.forEach((edition, index) => {
      console.log(`${index + 1}. ${edition.title} ${edition.editionNumber ? `(#${edition.editionNumber})` : ''} - ${edition.isPublished ? 'Published' : 'Draft'}`)
    })
    console.log()

    // Delete editions #2 and #3
    const deletedEditions = await prisma.edition.deleteMany({
      where: {
        editionNumber: {
          in: [2, 3]
        }
      }
    })

    console.log(`🗑️  Deleted ${deletedEditions.count} editions (#2 and #3)`)

    // Remove edition number from the SHIFTING TO ELECTRIC VEHICLE edition
    const updatedEdition = await prisma.edition.updateMany({
      where: {
        title: 'SHIFTING TO ELECTRIC VEHICLE'
      },
      data: {
        editionNumber: null
      }
    })

    console.log(`📝 Updated ${updatedEdition.count} edition(s) - removed edition number`)

    // Show final result
    console.log('\n✅ Cleanup completed! Final result:')
    const finalEditions = await prisma.edition.findMany({
      select: {
        id: true,
        title: true,
        editionNumber: true,
        isPublished: true,
      },
      orderBy: { createdAt: 'asc' }
    })

    finalEditions.forEach((edition, index) => {
      console.log(`${index + 1}. ${edition.title} ${edition.editionNumber ? `(#${edition.editionNumber})` : ''} - ${edition.isPublished ? 'Published' : 'Draft'}`)
    })

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupEditions()
