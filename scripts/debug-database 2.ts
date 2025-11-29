import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  console.log('🔍 Direct Database Query for Payments...\n')
  
  try {
    // First check database connection
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully\n')

    // Check all users first
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionType: true,
        subscriptionEnd: true,
        isActive: true
      }
    })
    console.log(`Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.subscriptionType}) - Active: ${user.isActive}`)
    })
    console.log('')

    // Get ALL payments with raw query to be sure
    console.log('Querying all payments...')
    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${payments.length} payments in database:\n`)

    if (payments.length === 0) {
      console.log('❌ No payments found in the database')
      
      // Let's also check the raw database URL
      console.log('\nDatabase Configuration:')
      console.log(`DATABASE_URL: ${process.env.DATABASE_URL}`)
    } else {
      payments.forEach((payment, index) => {
        console.log(`${index + 1}. Payment ID: ${payment.id}`)
        console.log(`   User: ${payment.user.email}`)
        console.log(`   Status: ${payment.status}`)
        console.log(`   Amount: ${payment.currency} ${payment.amount.toLocaleString()}`)
        console.log(`   Subscription Type: ${payment.subscriptionType}`)
        console.log(`   Created: ${payment.createdAt.toISOString()}`)
        console.log(`   Paid At: ${payment.paidAt?.toISOString() || 'Not paid'}`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ Database error:', error)
    console.log('\nThis might indicate:')
    console.log('1. Database connection issues')
    console.log('2. Environment variable problems')
    console.log('3. Prisma client not properly generated')
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
