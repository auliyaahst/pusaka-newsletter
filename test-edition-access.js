const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testEditionAccess() {
  try {
    console.log('=== Testing Edition Access ===');
    
    const editions = await prisma.edition.findMany({
      include: {
        articles: {
          include: {
            author: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: { articles: true }
        }
      }
    });
    
    console.log(`Found ${editions.length} editions:`);
    
    editions.forEach((edition, index) => {
      console.log(`\n${index + 1}. ${edition.title} (ID: ${edition.id})`);
      console.log(`   Published: ${edition.isPublished}`);
      console.log(`   Articles: ${edition._count.articles}`);
      console.log(`   Edition Number: ${edition.editionNumber || 'None'}`);
      
      if (edition.articles.length > 0) {
        console.log('   Articles in this edition:');
        edition.articles.forEach((article, i) => {
          console.log(`     ${i + 1}. ${article.title} (${article.status}) by ${article.author.name}`);
        });
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEditionAccess();
