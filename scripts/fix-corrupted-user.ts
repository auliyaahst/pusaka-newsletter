import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixCorruptedUser() {
  console.log('🔧 Fixing corrupted user record...\n')

  try {
    // Check the problematic user
    const problemUser = await prisma.user.findUnique({
      where: { email: 'blckout26@gmail.com' }
    })

    if (!problemUser) {
      console.log('❌ User blckout26@gmail.com not found')
      return
    }

    console.log('Found corrupted user:')
    console.log(`  ID: ${problemUser.id}`)
    console.log(`  Email: ${problemUser.email}`)
    console.log(`  Name: ${problemUser.name}`)
    console.log(`  Role: ${problemUser.role}`)
    console.log(`  IsActive: ${problemUser.isActive}`)
    console.log(`  IsVerified: ${problemUser.isVerified}`)

    // Fix the user record
    const fixedUser = await prisma.user.update({
      where: { email: 'blckout26@gmail.com' },
      data: {
        role: problemUser.role || 'CUSTOMER',
        isActive: problemUser.isActive !== null ? problemUser.isActive : true,
        isVerified: problemUser.isVerified !== null ? problemUser.isVerified : true,
        subscriptionType: problemUser.subscriptionType || 'FREE_TRIAL'
      }
    })

    console.log('\n✅ User record fixed:')
    console.log(`  Role: ${fixedUser.role}`)
    console.log(`  IsActive: ${fixedUser.isActive}`)
    console.log(`  IsVerified: ${fixedUser.isVerified}`)
    console.log(`  SubscriptionType: ${fixedUser.subscriptionType}`)

    // Clear all sessions to force fresh login
    await prisma.session.deleteMany()
    console.log('\n✅ All sessions cleared - users will need to login again')

  } catch (error) {
    console.error('❌ Error fixing user:', error)
  }
}

async function main() {
  await fixCorruptedUser()
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
