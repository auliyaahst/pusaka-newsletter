import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkEditions() {
  try {
    const allEditions = await prisma.edition.findMany({
      select: {
        id: true,
        title: true,
        editionNumber: true,
        isPublished: true,
        publishDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('📰 All Editions in Database:')
    console.log('================================')
    
    if (allEditions.length === 0) {
      console.log('❌ No editions found in database!')
    } else {
      allEditions.forEach((edition, index) => {
        console.log(`${index + 1}. ${edition.title}`)
        console.log(`   - ID: ${edition.id}`)
        console.log(`   - Number: ${edition.editionNumber || 'N/A'}`)
        console.log(`   - Published: ${edition.isPublished ? '✅ Yes' : '❌ No (Draft)'}`)
        console.log(`   - Publish Date: ${edition.publishDate.toDateString()}`)
        console.log(`   - Created: ${edition.createdAt.toDateString()}`)
        console.log('---')
      })
    }

    console.log('\n📊 Summary:')
    console.log(`Total editions: ${allEditions.length}`)
    console.log(`Published: ${allEditions.filter(e => e.isPublished).length}`)
    console.log(`Draft: ${allEditions.filter(e => !e.isPublished).length}`)
    
  } catch (error) {
    console.error('❌ Error checking editions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkEditions()
