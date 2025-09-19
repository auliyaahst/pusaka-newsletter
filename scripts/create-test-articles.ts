import { PrismaClient, ArticleStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestArticles() {
  try {
    console.log('Creating test articles...')
    
    // First, get or create an edition
    let edition = await prisma.edition.findFirst({
      where: { isPublished: true }
    })
    
    if (!edition) {
      edition = await prisma.edition.create({
        data: {
          title: 'Test Edition - First Quarter 2025',
          description: 'Test edition for publisher review functionality',
          publishDate: new Date(),
          isPublished: true,
          editionNumber: 1,
          theme: 'Technology and Innovation'
        }
      })
    }

    const testArticles = [
      {
        title: 'The Future of AI in Healthcare',
        content: `
          <h2>Introduction</h2>
          <p>Artificial Intelligence is revolutionizing the healthcare industry in unprecedented ways. From diagnostic tools to personalized treatment plans, AI is enabling healthcare professionals to provide better care to their patients.</p>
          
          <h2>Current Applications</h2>
          <p>Today, AI is being used in various healthcare applications including:</p>
          <ul>
            <li>Medical imaging and radiology</li>
            <li>Drug discovery and development</li>
            <li>Personalized medicine</li>
            <li>Virtual health assistants</li>
          </ul>
          
          <h2>Challenges and Opportunities</h2>
          <p>While AI presents tremendous opportunities, there are also challenges that need to be addressed, such as data privacy, ethical considerations, and regulatory compliance.</p>
          
          <h2>Conclusion</h2>
          <p>The future of AI in healthcare looks promising, with continued advancements expected to transform how we approach medical care and treatment.</p>
        `,
        excerpt: 'Exploring how artificial intelligence is transforming healthcare through innovative applications in diagnosis, treatment, and patient care.',
        slug: 'future-of-ai-in-healthcare',
        status: 'UNDER_REVIEW' as ArticleStatus,
        featured: true,
        readTime: 5,
        metaTitle: 'The Future of AI in Healthcare | Pusaka Newsletter',
        metaDescription: 'Discover how AI is revolutionizing healthcare through diagnostic tools, personalized medicine, and virtual assistants.',
        editionId: edition.id
      },
      {
        title: 'Sustainable Technology Trends for 2025',
        content: `
          <h2>Green Technology Revolution</h2>
          <p>As we move into 2025, sustainable technology is becoming more critical than ever. Companies worldwide are adopting green technologies to reduce their environmental impact.</p>
          
          <h2>Key Trends</h2>
          <p>The most significant sustainable technology trends include:</p>
          <ul>
            <li>Renewable energy storage solutions</li>
            <li>Carbon capture and utilization</li>
            <li>Smart grid technologies</li>
            <li>Circular economy platforms</li>
          </ul>
          
          <h2>Impact on Business</h2>
          <p>These technologies are not just good for the environment; they're also creating new business opportunities and driving innovation across industries.</p>
        `,
        excerpt: 'A comprehensive look at the sustainable technology trends that will shape 2025 and beyond.',
        slug: 'sustainable-technology-trends-2025',
        status: 'UNDER_REVIEW' as ArticleStatus,
        featured: false,
        readTime: 4,
        metaTitle: 'Sustainable Technology Trends for 2025 | Pusaka Newsletter',
        metaDescription: 'Explore the key sustainable technology trends that will drive innovation and environmental responsibility in 2025.',
        editionId: edition.id
      },
      {
        title: 'The Rise of Quantum Computing',
        content: `
          <h2>Quantum Leap</h2>
          <p>Quantum computing represents one of the most significant technological breakthroughs of our time. Unlike classical computers that use bits, quantum computers use quantum bits (qubits) that can exist in multiple states simultaneously.</p>
          
          <h2>Real-World Applications</h2>
          <p>Quantum computing has potential applications in:</p>
          <ul>
            <li>Cryptography and cybersecurity</li>
            <li>Financial modeling</li>
            <li>Drug discovery</li>
            <li>Weather prediction</li>
            <li>Optimization problems</li>
          </ul>
          
          <h2>Challenges Ahead</h2>
          <p>Despite its promise, quantum computing faces significant challenges including quantum decoherence, error rates, and the need for extremely low temperatures.</p>
          
          <h2>The Future</h2>
          <p>As quantum computing technology matures, we can expect to see breakthrough applications that will transform industries and solve complex problems that are currently intractable.</p>
        `,
        excerpt: 'Understanding the revolutionary potential of quantum computing and its implications for various industries.',
        slug: 'rise-of-quantum-computing',
        status: 'UNDER_REVIEW' as ArticleStatus,
        featured: false,
        readTime: 6,
        metaTitle: 'The Rise of Quantum Computing | Pusaka Newsletter',
        metaDescription: 'Discover how quantum computing is set to revolutionize industries from cryptography to drug discovery.',
        editionId: edition.id
      }
    ]

    for (const articleData of testArticles) {
      // Check if article already exists
      const existingArticle = await prisma.article.findUnique({
        where: { slug: articleData.slug }
      })

      if (existingArticle) {
        console.log(`Article already exists: ${articleData.title}`)
        continue
      }

      const article = await prisma.article.create({
        data: articleData
      })

      console.log(`✓ Created article: ${article.title} (${article.status})`)
    }

    console.log('\n🎉 Successfully created test articles!')
    console.log('\nTest articles are now available for review at:')
    console.log('- Publisher Dashboard: http://localhost:3000/dashboard/publisher')
    console.log('- Editorial Dashboard: http://localhost:3000/dashboard/editorial')

  } catch (error) {
    console.error('Error creating test articles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestArticles()
