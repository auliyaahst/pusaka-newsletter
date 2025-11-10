const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Simulate the API call logic
async function testApiLogic() {
  try {
    console.log('=== Testing Editorial Articles API Logic ===');
    
    const statusFilter = null; // No status filter
    
    const articles = await prisma.article.findMany({
      where: {
        // Editorial dashboard shows all articles for review and management
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        edition: {
          select: {
            id: true,
            title: true,
            publishDate: true,
          },
        },
      },
    });
    
    console.log(`API would return ${articles.length} articles`);
    
    if (articles.length > 0) {
      console.log('\nFirst few articles:');
      articles.slice(0, 3).forEach((article, index) => {
        console.log(`${index + 1}. ${article.title} (${article.status}) by ${article.author?.name}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApiLogic();
