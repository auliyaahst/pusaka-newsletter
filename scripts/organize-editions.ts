import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function organizeEditions() {
  try {
    console.log('🔄 Organizing editions...\n')
    
    // First, let's see what we have
    const allEditions = await prisma.edition.findMany({
      select: {
        id: true,
        title: true,
        editionNumber: true,
        isPublished: true,
        publishDate: true,
      },
      orderBy: { createdAt: 'asc' }
    })

    console.log('📰 Current editions:')
    allEditions.forEach((edition, index) => {
      console.log(`${index + 1}. ${edition.title} ${edition.editionNumber ? `(#${edition.editionNumber})` : '(No number)'} - ${edition.isPublished ? 'Published' : 'Draft'}`)
    })
    console.log()

    // Update "SHIFTING TO ELECTRIC VEHICLE" to be Edition #1 (First Edition)
    const electricVehicleEdition = await prisma.edition.updateMany({
      where: {
        title: 'SHIFTING TO ELECTRIC VEHICLE'
      },
      data: {
        editionNumber: 1
      }
    })

    if (electricVehicleEdition.count > 0) {
      console.log('✅ Set "SHIFTING TO ELECTRIC VEHICLE" as Edition #1 (First Edition)')
    }

    // Update "Nickel Downstream" to be Edition #2 (Second Edition)
    const nickelEdition = await prisma.edition.updateMany({
      where: {
        title: 'Nickel Downstream'
      },
      data: {
        editionNumber: 2
      }
    })

    if (nickelEdition.count > 0) {
      console.log('✅ Set "Nickel Downstream" as Edition #2 (Second Edition)')
    }

    // Check if there are any other editions that need to be removed
    const otherEditions = await prisma.edition.findMany({
      where: {
        AND: [
          { title: { not: 'SHIFTING TO ELECTRIC VEHICLE' } },
          { title: { not: 'Nickel Downstream' } }
        ]
      }
    })

    if (otherEditions.length > 0) {
      console.log(`\n🗑️  Found ${otherEditions.length} other edition(s) to remove:`)
      for (const edition of otherEditions) {
        console.log(`   - ${edition.title} ${edition.editionNumber ? `(#${edition.editionNumber})` : ''}`)
      }

      // Delete other editions
      const deletedEditions = await prisma.edition.deleteMany({
        where: {
          AND: [
            { title: { not: 'SHIFTING TO ELECTRIC VEHICLE' } },
            { title: { not: 'Nickel Downstream' } }
          ]
        }
      })

      console.log(`✅ Deleted ${deletedEditions.count} unwanted edition(s)`)
    }

    // Show final result
    console.log('\n✅ Edition organization completed! Final result:')
    const finalEditions = await prisma.edition.findMany({
      select: {
        id: true,
        title: true,
        editionNumber: true,
        isPublished: true,
        publishDate: true,
      },
      orderBy: { editionNumber: 'asc' }
    })

    finalEditions.forEach((edition, index) => {
      const editionLabel = edition.editionNumber === 1 ? 'First Edition' : 
                          edition.editionNumber === 2 ? 'Second Edition' : 
                          `Edition #${edition.editionNumber}`
      
      console.log(`${index + 1}. ${edition.title} (${editionLabel}) - ${edition.isPublished ? 'Published' : 'Draft'}`)
      console.log(`   Publish Date: ${edition.publishDate.toDateString()}`)
    })

    console.log('\n🎉 Now you have:')
    console.log('   📖 First Edition: SHIFTING TO ELECTRIC VEHICLE')
    console.log('   📖 Second Edition: Nickel Downstream')

  } catch (error) {
    console.error('❌ Error organizing editions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

organizeEditions()
