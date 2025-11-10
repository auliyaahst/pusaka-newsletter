const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugArticles() {
  try {
    console.log('=== CHECKING ARTICLES ===');
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        authorId: true,
        editionId: true,
        author: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        edition: {
          select: {
            title: true
          }
        }
      }
    });
    
    console.log(`Total articles in database: ${articles.length}`);
    
    if (articles.length > 0) {
      console.log('\n--- Articles Details ---');
      articles.forEach((article, index) => {
        console.log(`${index + 1}. Title: "${article.title}"`);
        console.log(`   Status: ${article.status}`);
        console.log(`   Author ID: ${article.authorId}`);
        console.log(`   Author: ${article.author?.name} (${article.author?.email}) - Role: ${article.author?.role}`);
        console.log(`   Edition: ${article.edition?.title || 'No edition'}`);
        console.log('');
      });
    }

    console.log('\n=== CHECKING USERS ===');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    console.log(`Total users: ${users.length}`);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role} - Articles: ${user._count.articles}`);
    });

    console.log('\n=== CHECKING EDITIONS ===');
    const editions = await prisma.edition.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    console.log(`Total editions: ${editions.length}`);
    editions.forEach(edition => {
      console.log(`- ${edition.title} (ID: ${edition.id}) - Articles: ${edition._count.articles}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugArticles();
