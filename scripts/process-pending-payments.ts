import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function processPendingPayments() {
  try {
    console.log('🔍 Finding all PENDING payments...')
    
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (pendingPayments.length === 0) {
      console.log('✅ No pending payments found!')
      return
    }

    console.log(`📦 Found ${pendingPayments.length} pending payments\n`)

    for (const payment of pendingPayments) {
      console.log(`\n💳 Processing payment:`)
      console.log(`  - Payment ID: ${payment.id}`)
      console.log(`  - Invoice ID: ${payment.xenditInvoiceId}`)
      console.log(`  - User: ${payment.user.email}`)
      console.log(`  - Amount: ${payment.currency} ${payment.amount}`)
      console.log(`  - Type: ${payment.subscriptionType}`)
      console.log(`  - Created: ${payment.createdAt.toISOString()}`)

      // Ask for confirmation (in production, you'd want to verify with Xendit API)
      console.log(`\n⚠️  Would mark as PAID and activate subscription`)
      
      // Calculate subscription end date
      const now = new Date()
      const user = await prisma.user.findUnique({
        where: { id: payment.userId },
        select: { subscriptionEnd: true }
      })
      
      const currentEnd = user?.subscriptionEnd ? new Date(user.subscriptionEnd) : null
      const startDate = currentEnd && currentEnd > now ? currentEnd : now
      const subscriptionEnd = new Date(startDate)
      
      switch (payment.subscriptionType) {
        case 'MONTHLY':
          subscriptionEnd.setDate(subscriptionEnd.getDate() + 30)
          break
        case 'QUARTERLY':
          subscriptionEnd.setDate(subscriptionEnd.getDate() + 90)
          break
        case 'ANNUALLY':
          subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1)
          break
      }

      console.log(`  - New subscription end: ${subscriptionEnd.toISOString()}`)
      
      // Update payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentMethod: 'MANUAL_PROCESSING'
        }
      })

      // Update user
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          subscriptionType: payment.subscriptionType,
          subscriptionEnd: subscriptionEnd,
          trialUsed: true,
          isActive: true
        }
      })

      console.log(`✅ Payment processed successfully!`)
    }

    console.log(`\n🎉 All ${pendingPayments.length} pending payments processed!`)

  } catch (error) {
    console.error('❌ Error processing payments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script with top-level await
await processPendingPayments()
