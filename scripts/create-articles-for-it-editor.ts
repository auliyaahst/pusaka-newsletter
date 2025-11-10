import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createArticlesForITEditor() {
  try {
    console.log('=== CREATING ARTICLES FOR IT EDITOR ===\n')
    
    // Find the IT Editor user
    const itEditor = await prisma.user.findUnique({
      where: { email: 'it.editor@thepusaka.id' }
    })
    
    if (!itEditor) {
      console.log('❌ IT Editor user not found!')
      return
    }
    
    console.log(`✅ IT Editor found: ${itEditor.name} (${itEditor.email})`)
    console.log(`   User ID: ${itEditor.id}`)
    
    // Find an existing edition to assign articles to
    const edition = await prisma.edition.findFirst({
      where: { isPublished: true }
    })
    
    if (!edition) {
      console.log('❌ No published edition found!')
      return
    }
    
    console.log(`✅ Using edition: "${edition.title}"`)
    
    // Create sample articles for IT Editor
    const sampleArticles = [
      {
        title: "Digital Transformation in Indonesian SOEs",
        excerpt: "How state-owned enterprises are leveraging technology for modernization and efficiency improvements.",
        content: `<h2>Digital Transformation in Indonesian SOEs</h2>
<p>State-owned enterprises in Indonesia are undergoing significant digital transformation initiatives to improve operational efficiency and competitiveness in the modern economy.</p>
<h3>Key Areas of Innovation</h3>
<ul>
<li>Cloud computing adoption</li>
<li>Data analytics and AI implementation</li>
<li>Process automation</li>
<li>Customer experience enhancement</li>
</ul>
<p>These initiatives are positioning Indonesian SOEs for sustainable growth in the digital age.</p>`,
        status: 'PUBLISHED'
      },
      {
        title: "Cybersecurity Challenges in Indonesian Infrastructure",
        excerpt: "An analysis of cybersecurity threats facing Indonesia's critical infrastructure and mitigation strategies.",
        content: `<h2>Cybersecurity Challenges in Indonesian Infrastructure</h2>
<p>As Indonesia's digital infrastructure expands, cybersecurity has become a critical concern for maintaining national security and economic stability.</p>
<h3>Major Threat Vectors</h3>
<ul>
<li>Advanced persistent threats (APTs)</li>
<li>Ransomware attacks</li>
<li>Supply chain vulnerabilities</li>
<li>IoT device security risks</li>
</ul>
<p>A comprehensive approach to cybersecurity is essential for protecting Indonesia's digital future.</p>`,
        status: 'UNDER_REVIEW'
      },
      {
        title: "Tech Startup Ecosystem in Indonesia: 2025 Outlook",
        excerpt: "Exploring the growth trajectory and challenges facing Indonesia's vibrant tech startup ecosystem.",
        content: `<h2>Tech Startup Ecosystem in Indonesia: 2025 Outlook</h2>
<p>Indonesia's tech startup ecosystem continues to evolve rapidly, with increasing investment and innovation across various sectors.</p>
<h3>Growth Sectors</h3>
<ul>
<li>Fintech and digital banking</li>
<li>E-commerce and logistics</li>
<li>Healthtech solutions</li>
<li>Sustainable technology</li>
</ul>
<p>The ecosystem is maturing with stronger support infrastructure and increased government backing.</p>`,
        status: 'DRAFT'
      }
    ]
    
    console.log(`\n📝 Creating ${sampleArticles.length} articles...`)
    
    for (const articleData of sampleArticles) {
      console.log(`   Creating "${articleData.title}"...`)
      
      // Generate slug from title
      const slug = articleData.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      const article = await prisma.article.create({
        data: {
          title: articleData.title,
          slug: slug,
          excerpt: articleData.excerpt,
          content: articleData.content,
          status: articleData.status as any,
          authorId: itEditor.id,
          editionId: edition.id,
        }
      })
      
      console.log(`   ✅ Created: ${article.id}`)
    }
    
    // Verify the articles were created
    const createdArticles = await prisma.article.findMany({
      where: {
        authorId: itEditor.id
      },
      select: {
        id: true,
        title: true,
        status: true
      }
    })
    
    console.log(`\n✅ SUCCESS: Created ${createdArticles.length} articles for IT Editor`)
    console.log('\n📋 NEXT STEPS:')
    console.log('   1. Login to dev.thepusaka.id as it.editor@thepusaka.id')
    console.log('   2. Go to Article Management')
    console.log('   3. You should now see the articles!')
    
    console.log('\n📝 Articles created:')
    for (const article of createdArticles) {
      console.log(`   - "${article.title}" (${article.status})`)
    }
    
  } catch (error) {
    console.error('❌ Error creating articles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createArticlesForITEditor()
