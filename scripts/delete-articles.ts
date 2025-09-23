import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAllArticles() {
  try {
    // First delete all review notes (due to foreign key constraints)
    const deletedReviewNotes = await prisma.reviewNote.deleteMany({})
    console.log(`Deleted ${deletedReviewNotes.count} review notes`)
    
    // Then delete all articles
    const deletedArticles = await prisma.article.deleteMany({})
    console.log(`Deleted ${deletedArticles.count} articles`)
    
    console.log('All articles and related data have been deleted successfully!')
  } catch (error) {
    console.error('Error deleting articles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllArticles()
