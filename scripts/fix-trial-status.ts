import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixTrialUsedForExistingUsers() {
  try {
    console.log('Fixing trialUsed status for existing users with paid subscriptions...\n')
    
    // Find users who have paid subscriptions but haven't used trial
    const usersToUpdate = await prisma.user.findMany({
      where: {
        trialUsed: false,
        subscriptionType: {
          in: ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUALLY']
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionType: true,
        trialUsed: true
      }
    })

    if (usersToUpdate.length === 0) {
      console.log('No users found that need updating.')
      return
    }

    console.log(`Found ${usersToUpdate.length} users with paid subscriptions who haven't been marked as trial used:`)
    
    for (const user of usersToUpdate) {
      console.log(`- ${user.email} (${user.subscriptionType})`)
    }

    console.log('\nUpdating users...')

    // Update all these users to mark trialUsed as true
    const result = await prisma.user.updateMany({
      where: {
        id: {
          in: usersToUpdate.map(u => u.id)
        }
      },
      data: {
        trialUsed: true
      }
    })

    console.log(`✅ Successfully updated ${result.count} users.`)
    console.log('\nThese users will no longer see the free trial option.')

  } catch (error) {
    console.error('Error fixing trial status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixTrialUsedForExistingUsers()
