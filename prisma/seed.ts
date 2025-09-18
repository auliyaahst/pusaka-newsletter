import { PrismaClient, ArticleStatus, ContentType, UserRole, SubscriptionType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create test users with different roles and subscription types
  console.log('Creating test users...')
  
  const testUsers = [
    {
      id: 'admin-user-1',
      name: 'Admin User',
      email: 'admin@pusaka.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'ADMIN' as const,
      subscriptionType: 'ANNUALLY' as const,
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
      trialUsed: false,
    },
    {
      id: 'publisher-user-1',
      name: 'John Publisher',
      email: 'publisher@pusaka.com',
      password: await bcrypt.hash('publisher123', 12),
      role: 'PUBLISHER' as const,
      subscriptionType: 'QUARTERLY' as const,
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
      isActive: true,
      trialUsed: false,
    },
    {
      id: 'editor-user-1',
      name: 'Jane Editor',
      email: 'editor@pusaka.com',
      password: await bcrypt.hash('editor123', 12),
      role: 'EDITOR' as const,
      subscriptionType: 'MONTHLY' as const,
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
      isActive: true,
      trialUsed: false,
    },
    {
      id: 'customer-user-1',
      name: 'Alice Customer',
      email: 'customer@pusaka.com',
      password: await bcrypt.hash('customer123', 12),
      role: 'CUSTOMER' as const,
      subscriptionType: 'HALF_YEARLY' as const,
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      isActive: true,
      trialUsed: false,
    },
    {
      id: 'trial-user-1',
      name: 'Bob Trial',
      email: 'test@pusaka.com',
      password: await bcrypt.hash('test123', 12),
      role: 'CUSTOMER' as const,
      subscriptionType: 'FREE_TRIAL' as const,
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true,
      trialUsed: true,
    },
    // {
    //   id: 'inactive-user-1',
    //   name: 'Charlie Inactive',
    //   email: 'inactive@pusaka.com',
    //   password: await bcrypt.hash('inactive123', 12),
    //   role: 'CUSTOMER' as const,
    //   subscriptionType: 'MONTHLY' as const,
    //   subscriptionStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
    //   subscriptionEnd: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago (expired)
    //   isActive: false,
    //   trialUsed: true,
    // },
    // {
    //   id: 'premium-user-1',
    //   name: 'David Premium',
    //   email: 'premium@pusaka.com',
    //   password: await bcrypt.hash('premium123', 12),
    //   role: 'CUSTOMER' as const,
    //   subscriptionType: 'ANNUALLY' as const,
    //   subscriptionStart: new Date(),
    //   subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    //   isActive: true,
    //   trialUsed: true,
    // },
  ]

  for (const user of testUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: user,
    })
  }

  console.log(`Created ${testUsers.length} test users`)

  // Create first edition
  const edition1 = await prisma.edition.upsert({
    where: { id: 'edition-1' },
    update: {},
    create: {
      id: 'edition-1',
      title: 'SHIFTING TO ELECTRIC VEHICLE',
      description: 'First Edition exploring the transition to electric vehicles and its implications for Indonesia',
      publishDate: new Date('2024-07-25'),
      isPublished: true,
      editionNumber: 1,
      theme: 'Electric Vehicles & Sustainability',
    },
  })

  // Create articles for the first edition
  const articles = [
    {
      id: 'article-1',
      title: 'The Transition to EVs and Implications',
      slug: 'transition-to-evs-implications',
      excerpt: 'The period 2020 - 2040 will be a transition period from the fuel car era to EVs, which will be marked by polemics regarding EVs.',
      content: `
        <h2>Executive Summary</h2>
        <ul>
          <li>2020 – 2040 is shifting period from conventional car to EVs.</li>
          <li>Shifting in developing countries, such as Indonesia, could be delayed until 2050.</li>
          <li>Shifting could result in the closure of many component industries, increasing unemployment.</li>
        </ul>

        <p>The first car in the world is electric. In fact, the electric car was first invented in 1820. Then, the first mass-produced car was started by the Ford Motor Company in 1908. Then, the era of conventional car, oil-powered cars began. This era of conventional car oil powered is projected to end in 2050. So, the era of electric cars has lasted 88 years. But in fact, the first electric car was created only three years later, in 1888. The first electric car was the Flocken Elektrowagen, was created by Andreas Flocken in Germany.</p>

        <p>However, the oil-powered car industry was chosen for mass development because of the oil boom at the Time. Previously, the oil-based car industry was also successfully built and exploited oil in Titusville, Pennsylvania, United States. Therefore, economically, the oil-powered car industry was more compatible (and profitable) with the oil industry in the United States at that time. So, the oil-powered car industry since 1908 – 1908.</p>

        <h3>The Global Context</h3>
        <p>The electric vehicle industry began developing across various parts of the world in the late 20th and early 21st centuries. The development of the electric vehicle industry was driven by two factors. First, the emergence of a collective global awareness about the importance of curbing carbon emissions to curb global climate change, and global warming. It culminated in the birth of the Paris Agreement and the Sustainable Development Goals (SDGs), which by the UN in 2015. Second, technological advances in electric power storage batteries. This meant that the development of the electric vehicle industry was dedicated to environmental sustainability.</p>
      `,
      contentType: ContentType.HTML,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2024-07-25'),
      order: 1,
      featured: true,
      readTime: 8,
      editionId: edition1.id,
    },
    {
      id: 'article-2',
      title: 'Indonesian Battery and EV Market Snapshot',
      slug: 'indonesian-battery-ev-market-snapshot',
      excerpt: 'Indonesian car consumers are still skeptical about EVs, faced with a choice: fuel car or EV.',
      content: `
        <h2>Current Market Dynamics</h2>
        <p>Observing the Indonesian car market, Indonesian car sales data for 2023 shows that Indonesians are around 1.35 million cars. The majority of cars are automotive vehicles purchased by fuel-powered cars. The current trend of EV car purchases among current population of Indonesia is still relatively low.</p>

        <p>This data is a ratio of new car sales were 924,000 units, should be 1.35 million. Meanwhile, the average EV car sales were 10,000 more. This resulted in a 5.9% share of the total automotive car sales market in Indonesia.</p>

        <h3>Consumer Behavior Analysis</h3>
        <p>All current technical hurdles for charging an EV, EV owners are facing. Remember, many global automotive companies can achieve second-highest economy in the world.</p>

        <h3>Market Challenges</h3>
        <p>The key points about EV batteries in Indonesia are the cost between 60% and the expired EV batteries are 3,500 VA) to 7,500 VA). EVs like charging an EV, EV owners have to provide as PLN.</p>

        <p>With the notes, the specific advantages for Indonesian consumers, but its low electrical capacity are sold. Indonesia's electrical capacity of up to 1,000 customers with a cap of 900 VA.</p>
      `,
      contentType: ContentType.HTML,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2024-07-25'),
      order: 2,
      featured: false,
      readTime: 6,
      editionId: edition1.id,
    },
    {
      id: 'article-3',
      title: 'Technology Will Address',
      slug: 'technology-will-address',
      excerpt: 'The various weaknesses of EVs will soon be overcome with technological advances.',
      content: `
        <h2>Technological Solutions on the Horizon</h2>
        <p>The transition from conventional cars to EVs will be faster in developed countries. They have a higher energy mix, more adequate supporting infrastructure, and greater consumer purchasing power. Meanwhile, in developing countries, the introduction of electric cars is primarily used as city cars. In small towns or rural areas, electric cars cannot yet replace conventional cars. In Indonesia, it is estimated that electric cars will completely replace conventional cars by 2050, once the electricity and road infrastructure is compatible with electric cars.</p>

        <h3>Infrastructure Development</h3>
        <p>By the end of 2024, there are 1,582 Public Electric Vehicle Supply Equipment (PEVSE) or Public EV Charging Stations for EV charging. there are 28 cities in Indonesia out of 514 cities.</p>

        <h3>Battery Technology Advances</h3>
        <p>Another challenge is the availability and electric cars. From a technical perspective, Indonesia are considering that as a result of the lifetime of EV batteries, their vehicles are hard objects to achieve.</p>

        <p>The availability of charging stations in Indonesia are cutting the EV market. Indonesian automotive attitude of automotive manufacturers generally (can be repaired) and their ability to is very small and is still limited.</p>
      `,
      contentType: ContentType.HTML,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2024-07-25'),
      order: 3,
      featured: false,
      readTime: 5,
      editionId: edition1.id,
    },
    {
      id: 'article-4',
      title: 'Indonesia Must Have a National EV Brand',
      slug: 'indonesia-national-ev-brand',
      excerpt: 'In the EV era, Indonesia can no longer be just a market for foreign brands; it must have a national Indonesian brand.',
      content: `
        <h2>The Strategic Importance of National EV Brand</h2>
        <p>So, where are the opportunities for Indonesia? First, the EV industry is not yet established. Second, the EV industry in Indonesia will develop in the future.</p>

        <p>Second, currently, approximately 1.5%-3%, processed using Ferro nickel, and stainless steel. The HPAL method is limited to be processed. MHP is then further processed. This industry is still relatively small.</p>

        <h3>Natural Resource Advantages</h3>
        <p>Indonesia has significant natural resource advantages in the EV industry, particularly in nickel reserves which are crucial for battery production. This presents a unique opportunity for Indonesia to develop its own EV ecosystem from raw materials to finished products.</p>

        <h3>Policy and Industry Development</h3>
        <p>The government's role in fostering a national EV brand includes creating supportive policies, investing in research and development, and establishing partnerships between local companies and international technology providers.</p>

        <h3>Future Prospects</h3>
        <p>Developing a national EV brand would not only create jobs and boost the economy but also position Indonesia as a leader in the sustainable transportation sector in Southeast Asia.</p>
      `,
      contentType: ContentType.HTML,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2024-07-25'),
      order: 4,
      featured: false,
      readTime: 7,
      editionId: edition1.id,
    },
  ]

  for (const article of articles) {
    await prisma.article.upsert({
      where: { id: article.id },
      update: {},
      create: article,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
