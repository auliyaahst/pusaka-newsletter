import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTrialStatus() {
  try {
    console.log('Checking trial status for all users...\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        trialUsed: true,
        subscriptionType: true,
        subscriptionEnd: true,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (users.length === 0) {
      console.log('No users found.')
      return
    }

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Name: ${user.name || 'No name'}`)
      console.log(`  Trial Used: ${user.trialUsed}`)
      console.log(`  Subscription Type: ${user.subscriptionType}`)
      console.log(`  Subscription End: ${user.subscriptionEnd?.toISOString() || 'No end date'}`)
      console.log(`  Is Active: ${user.isActive}`)
      console.log(`  Should see free trial: ${!user.trialUsed ? 'YES' : 'NO'}`)
      console.log('---')
    })

  } catch (error) {
    console.error('Error checking trial status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTrialStatus()
