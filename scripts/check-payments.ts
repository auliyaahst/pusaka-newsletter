import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking Payment Records...\n')

  // Get all payments
  const payments = await prisma.payment.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          subscriptionType: true,
          subscriptionEnd: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })

  if (payments.length === 0) {
    console.log('❌ No payment records found in database')
    console.log('\nPossible issues:')
    console.log('1. Payment creation API not being called')
    console.log('2. Database connection issue')
    console.log('3. Prisma client not properly generated')
    return
  }

  console.log(`✅ Found ${payments.length} payment records:\n`)

  payments.forEach((payment, index) => {
    console.log(`${index + 1}. Payment ID: ${payment.id}`)
    console.log(`   User: ${payment.user.email} (${payment.user.name || 'No name'})`)
    console.log(`   Amount: ${payment.currency} ${payment.amount.toLocaleString()}`)
    console.log(`   Status: ${payment.status}`)
    console.log(`   Subscription Type: ${payment.subscriptionType}`)
    console.log(`   Xendit Invoice ID: ${payment.xenditInvoiceId}`)
    console.log(`   External ID: ${payment.externalId}`)
    console.log(`   Payment Method: ${payment.paymentMethod || 'Not set'}`)
    console.log(`   Paid At: ${payment.paidAt ? payment.paidAt.toISOString() : 'Not paid'}`)
    console.log(`   Created At: ${payment.createdAt.toISOString()}`)
    console.log(`   Invoice URL: ${payment.invoiceUrl || 'No URL'}`)
    console.log(`\n   User Subscription Status:`)
    console.log(`   - Type: ${payment.user.subscriptionType}`)
    console.log(`   - Expires: ${payment.user.subscriptionEnd ? payment.user.subscriptionEnd.toISOString() : 'Not set'}`)
    console.log('\n' + '='.repeat(80) + '\n')
  })

  // Check for pending payments
  const pendingPayments = payments.filter(p => p.status === 'PENDING')
  if (pendingPayments.length > 0) {
    console.log(`⏳ ${pendingPayments.length} pending payment(s) found`)
    console.log('These payments are waiting for webhook confirmation from Xendit\n')
  }

  // Check for paid payments
  const paidPayments = payments.filter(p => p.status === 'PAID')
  if (paidPayments.length > 0) {
    console.log(`✅ ${paidPayments.length} paid payment(s) found`)
    console.log('These subscriptions should be active\n')
  }

  // Check for failed/expired payments
  const failedPayments = payments.filter(p => p.status === 'EXPIRED' || p.status === 'FAILED')
  if (failedPayments.length > 0) {
    console.log(`❌ ${failedPayments.length} failed/expired payment(s) found\n`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
