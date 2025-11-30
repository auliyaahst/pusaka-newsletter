import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking editions in database...')
  
  const editions = await prisma.edition.findMany({
    where: {
      isPublished: true
    },
    select: {
      id: true,
      title: true,
      isPublished: true
    }
  })
  
  console.log('Found editions:', editions)
  
  if (editions.length === 0) {
    console.log('No published editions found. Creating a test edition...')
    
    const testEdition = await prisma.edition.create({
      data: {
        title: 'Test Edition',
        description: 'A test edition for development',
        isPublished: true,
        publishDate: new Date(),
        coverImage: '/images/test-cover.jpg'
      }
    })
    
    console.log('Created test edition:', testEdition)
  }
  
  await prisma.$disconnect()
}
