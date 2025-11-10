import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugEditorialArticles() {
  try {
    console.log('=== DEBUGGING EDITORIAL ARTICLES SYSTEM ===\n')
    
    // 1. Check all users
    console.log('1. USERS IN DATABASE:')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        _count: {
          select: {
            articles: true
          }
        }
      }
    })
    
    for (const user of users) {
      console.log(`   - ${user.name} (${user.email})`)
      console.log(`     Role: ${user.role}, Active: ${user.isActive}`)
      console.log(`     Articles: ${user._count.articles}`)
      console.log(`     User ID: ${user.id}`)
      console.log('')
    }
    
    // 2. Check all articles
    console.log('2. ALL ARTICLES IN DATABASE:')
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        authorId: true,
        editionId: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`   Total articles: ${articles.length}`)
    for (const article of articles) {
      console.log(`   - "${article.title}"`)
      if (article.author) {
        console.log(`     Author: ${article.author.name} (${article.author.email}) - ${article.author.role}`)
      } else {
        console.log(`     Author: [No author data]`)
      }
      console.log(`     Status: ${article.status}`)
      console.log(`     Author ID: ${article.authorId}`)
      console.log(`     Edition ID: ${article.editionId || 'None'}`)
      console.log(`     Created: ${article.createdAt}`)
      console.log('')
    }
    
    // 3. Check editor user specifically
    console.log('3. EDITOR USER CHECK:')
    const editorUser = await prisma.user.findFirst({
      where: { 
        role: 'EDITOR' 
      },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          }
        }
      }
    })
    
    if (editorUser) {
      console.log(`   Editor found: ${editorUser.name} (${editorUser.email})`)
      console.log(`   Editor ID: ${editorUser.id}`)
      console.log(`   Articles by this editor: ${editorUser.articles.length}`)
      for (const article of editorUser.articles) {
        console.log(`     - "${article.title}" (${article.status}) - ${article.createdAt}`)
      }
    } else {
      console.log('   No editor user found!')
    }
    
    // 4. Check editions
    console.log('\n4. EDITIONS:')
    const editions = await prisma.edition.findMany({
      select: {
        id: true,
        title: true,
        isPublished: true,
        _count: {
          select: {
            articles: true
          }
        }
      }
    })
    
    for (const edition of editions) {
      console.log(`   - "${edition.title}"`)
      console.log(`     ID: ${edition.id}`)
      console.log(`     Published: ${edition.isPublished}`)
      console.log(`     Articles: ${edition._count.articles}`)
      console.log('')
    }
    
    console.log('=== DEBUG COMPLETE ===')
    
  } catch (error) {
    console.error('Error during debug:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugEditorialArticles()
