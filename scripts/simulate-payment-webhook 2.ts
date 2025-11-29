import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function simulatePaymentSuccess(paymentId?: string) {
  console.log('🧪 Simulating Payment Webhook Success...\n')

  let payment
  
  if (paymentId) {
    // Find specific payment
    payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true }
    })
    
    if (!payment) {
      console.log(`❌ Payment with ID ${paymentId} not found`)
      return
    }
  } else {
    // Find the most recent pending payment
    payment = await prisma.payment.findFirst({
      where: { status: 'PENDING' },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    })
    
    if (!payment) {
      console.log('❌ No pending payments found')
      return
    }
  }

  console.log(`Found payment: ${payment.id}`)
  console.log(`User: ${payment.user.email}`)
  console.log(`Amount: ${payment.currency} ${payment.amount.toLocaleString()}`)
  console.log(`Subscription Type: ${payment.subscriptionType}`)
  console.log(`Current Status: ${payment.status}\n`)

  if (payment.status === 'PAID') {
    console.log('⚠️  Payment is already marked as PAID')
    return
  }

  try {
    // Get user's current subscription end date
    const user = await prisma.user.findUnique({
      where: { id: payment.userId },
      select: { subscriptionEnd: true }
    })
    
    // Calculate new subscription end date
    const now = new Date()
    const currentEnd = user?.subscriptionEnd ? new Date(user.subscriptionEnd) : null
    const startDate = currentEnd && currentEnd > now ? currentEnd : now
    
    const subscriptionEnd = new Date(startDate)
    
    // Add subscription duration based on type
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
      default:
        subscriptionEnd.setDate(subscriptionEnd.getDate() + 30)
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paymentMethod: 'SIMULATED_SUCCESS'
      }
    })

    // Update user subscription
    await prisma.user.update({
      where: { id: payment.userId },
      data: {
        subscriptionType: payment.subscriptionType,
        subscriptionEnd: subscriptionEnd,
        trialUsed: true,
        isActive: true
      }
    })

    console.log('✅ Payment simulation successful!')
    console.log(`💰 Payment status updated to: PAID`)
    console.log(`📅 Subscription activated until: ${subscriptionEnd.toISOString()}`)
    console.log(`🔄 User subscription type: ${payment.subscriptionType}`)
    
    if (currentEnd && currentEnd > now) {
      console.log(`📈 Subscription extended from ${currentEnd.toISOString()}`)
    } else {
      console.log(`🆕 New subscription started`)
    }

  } catch (error) {
    console.error('❌ Error simulating payment:', error)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const paymentId = args[0]

  if (paymentId) {
    console.log(`🎯 Targeting specific payment: ${paymentId}\n`)
  } else {
    console.log('🔍 Looking for most recent pending payment...\n')
  }

  await simulatePaymentSuccess(paymentId)
}

main()
  .catch((error) => {
    console.error('Script error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
