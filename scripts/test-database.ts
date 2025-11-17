import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Testing Database Connection and Schema...\n')

  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connection successful\n')

    // Check if users exist
    const userCount = await prisma.user.count()
    console.log(`👥 Users in database: ${userCount}`)

    if (userCount > 0) {
      const recentUser = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          subscriptionType: true,
          subscriptionEnd: true,
          createdAt: true
        }
      })
      console.log('\n📧 Most recent user:')
      console.log(`   Email: ${recentUser?.email}`)
      console.log(`   Name: ${recentUser?.name || 'No name'}`)
      console.log(`   Subscription: ${recentUser?.subscriptionType}`)
      console.log(`   Expires: ${recentUser?.subscriptionEnd ? recentUser.subscriptionEnd.toISOString() : 'Not set'}`)
    }

    // Check Payment table structure
    console.log('\n📋 Checking Payment table...')
    const paymentCount = await prisma.payment.count()
    console.log(`💳 Payments in database: ${paymentCount}`)

    // Try to create a test payment (will rollback)
    console.log('\n🧪 Testing payment creation...')
    
    if (userCount === 0) {
      console.log('⚠️  No users found - cannot test payment creation')
      console.log('   Create a user first by signing up on the website')
      return
    }

    const testUser = await prisma.user.findFirst()
    if (!testUser) {
      console.log('❌ Could not find test user')
      return
    }

    console.log(`   Using test user: ${testUser.email}`)
    console.log('   Attempting to create test payment record...')

    const testPayment = await prisma.payment.create({
      data: {
        userId: testUser.id,
        amount: 99000,
        currency: 'IDR',
        status: 'PENDING',
        xenditInvoiceId: `test-invoice-${Date.now()}`,
        externalId: `test-external-${Date.now()}`,
        subscriptionType: 'MONTHLY',
        invoiceUrl: 'https://test.xendit.co/invoice-test'
      }
    })

    console.log('✅ Test payment created successfully!')
    console.log(`   Payment ID: ${testPayment.id}`)
    console.log(`   Status: ${testPayment.status}`)

    // Delete test payment
    await prisma.payment.delete({
      where: { id: testPayment.id }
    })
    console.log('✅ Test payment deleted (cleanup successful)')

    console.log('\n✨ Database schema is working correctly!')
    console.log('\n🔍 Issue Analysis:')
    console.log('   Database connection: ✅ Working')
    console.log('   Payment table: ✅ Accessible')
    console.log('   Payment creation: ✅ Working')
    console.log('\n💡 The issue is likely:')
    console.log('   1. Payment creation API is not being reached')
    console.log('   2. API is throwing an error before saving to database')
    console.log('   3. Check browser console and network tab for errors')
    console.log('   4. Check Next.js terminal logs for API errors')

  } catch (error) {
    console.error('❌ Error during test:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
