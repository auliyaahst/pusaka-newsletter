import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixOAuthAccountLinking() {
  console.log('🔗 Fixing OAuth Account Linking Issues...\n')

  try {
    // Find users who might have OAuth linking issues
    const users = await prisma.user.findMany({
      include: {
        accounts: true
      },
      where: {
        accounts: {
          none: {}
        },
        // Users without accounts (password-only users)
      }
    })

    console.log(`Found ${users.length} users without OAuth accounts:`)
    
    for (const user of users) {
      console.log(`  - ${user.email} (${user.role})`)
    }

    // Also check for accounts without proper linkage
    const orphanAccounts = await prisma.account.findMany({
      include: {
        user: true
      }
    })

    console.log(`\nFound ${orphanAccounts.length} OAuth accounts:`)
    
    for (const account of orphanAccounts) {
      console.log(`  - ${account.provider}: ${account.user.email}`)
    }

    // Check for duplicate emails between OAuth and password users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: true,
        accounts: true
      }
    })

    const emailGroups = allUsers.reduce((acc, user) => {
      if (!acc[user.email]) acc[user.email] = []
      acc[user.email].push(user)
      return acc
    }, {} as Record<string, typeof allUsers>)

    console.log('\nChecking for email conflicts:')
    
    for (const [email, users] of Object.entries(emailGroups)) {
      if (users.length > 1) {
        console.log(`❌ CONFLICT: ${email} has ${users.length} accounts`)
        for (const user of users) {
          const hasPassword = !!user.password
          const hasOAuth = user.accounts.length > 0
          console.log(`   - ID: ${user.id} | Password: ${hasPassword} | OAuth: ${hasOAuth}`)
        }
      }
    }

    console.log('\n💡 To fix OAuth linking issues:')
    console.log('1. Delete duplicate accounts manually')
    console.log('2. Or merge accounts by linking OAuth to existing password account')
    console.log('3. Or ask user to use consistent login method')

  } catch (error) {
    console.error('❌ Error checking OAuth accounts:', error)
  }
}

async function main() {
  await fixOAuthAccountLinking()
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
