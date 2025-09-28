import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteExtraEditions() {
  try {
    console.log('🔍 Checking current editions...')
    
    // First, let's see what we have
    const allEditions = await prisma.edition.findMany({
      select: {
        id: true,
        title: true,
        editionNumber: true,
        isPublished: true,
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: { editionNumber: 'asc' }
    })

    console.log('\n📰 Current Editions:')
    allEditions.forEach((edition, index) => {
      console.log(`${index + 1}. ${edition.title} (#${edition.editionNumber}) - ${edition.isPublished ? 'Published' : 'Draft'} - ${edition._count.articles} articles`)
    })

    // Find editions to delete (#2 and #3)
    const editionsToDelete = allEditions.filter(edition => 
      edition.editionNumber === 2 || edition.editionNumber === 3
    )

    if (editionsToDelete.length === 0) {
      console.log('\n✅ No editions #2 or #3 found to delete.')
      return
    }

    console.log(`\n⚠️  Will delete ${editionsToDelete.length} editions:`)
    editionsToDelete.forEach(edition => {
      console.log(`- ${edition.title} (#${edition.editionNumber}) - ${edition._count.articles} articles`)
    })

    // Check if any of these editions have articles
    const editionsWithArticles = editionsToDelete.filter(edition => edition._count.articles > 0)
    
    if (editionsWithArticles.length > 0) {
      console.log('\n⚠️  WARNING: Some editions have articles assigned to them:')
      editionsWithArticles.forEach(edition => {
        console.log(`- ${edition.title} has ${edition._count.articles} articles`)
      })
      
      // First, update articles to remove edition assignment
      for (const edition of editionsWithArticles) {
        console.log(`📝 Removing edition assignment from articles in "${edition.title}"...`)
        
        const updatedArticles = await prisma.article.updateMany({
          where: { editionId: edition.id },
          data: { editionId: null }
        })
        
        console.log(`   ✅ Updated ${updatedArticles.count} articles`)
      }
    }

    // Now delete the editions
    console.log('\n🗑️  Deleting editions...')
    
    for (const edition of editionsToDelete) {
      await prisma.edition.delete({
        where: { id: edition.id }
      })
      console.log(`   ✅ Deleted: ${edition.title} (#${edition.editionNumber})`)
    }

    console.log('\n✅ Cleanup completed!')
    
    // Show final result
    const remainingEditions = await prisma.edition.findMany({
      select: {
        id: true,
        title: true,
        editionNumber: true,
        isPublished: true,
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: { editionNumber: 'asc' }
    })

    console.log('\n📰 Remaining Editions:')
    if (remainingEditions.length === 0) {
      console.log('   (No editions remaining)')
    } else {
      remainingEditions.forEach((edition, index) => {
        console.log(`${index + 1}. ${edition.title} (#${edition.editionNumber}) - ${edition.isPublished ? 'Published' : 'Draft'} - ${edition._count.articles} articles`)
      })
    }

  } catch (error) {
    console.error('❌ Error deleting editions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteExtraEditions()
