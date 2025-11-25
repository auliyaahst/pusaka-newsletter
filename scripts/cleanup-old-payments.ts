import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupOldPendingPayments() {
  console.log('🧹 Cleaning up old pending payments...\n')

  try {
    // Find all pending payments older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    const oldPendingPayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: oneHourAgo
        }
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    })

    if (oldPendingPayments.length === 0) {
      console.log('✅ No old pending payments found.')
      return
    }

    console.log(`Found ${oldPendingPayments.length} old pending payments:`)
    
    for (const payment of oldPendingPayments) {
      console.log(`  - ${payment.id} (${payment.user.email}) - Created: ${payment.createdAt.toISOString()}`)
    }

    // Ask for confirmation (in a real script, you might want to add this)
    console.log('\n⚠️  These payments are older than 1 hour and likely expired.')
    
    // Update them to EXPIRED
    const updateResult = await prisma.payment.updateMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: oneHourAgo
        }
      },
      data: {
        status: 'EXPIRED'
      }
    })

    console.log(`✅ Updated ${updateResult.count} payments to EXPIRED status.`)
    
  } catch (error) {
    console.error('❌ Error cleaning up payments:', error)
  }
}

async function main() {
  await cleanupOldPendingPayments()
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
