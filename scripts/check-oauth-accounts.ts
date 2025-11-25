import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function checkAccountLinks() {
  console.log('🔍 Checking OAuth Account Links...\n')
  
  try {
    // Check database connection
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully\n')

    // Check all OAuth accounts
    const accounts = await prisma.account.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    console.log(`Found ${accounts.length} OAuth account links:\n`)

    if (accounts.length === 0) {
      console.log('❌ No OAuth accounts found')
    } else {
      for (const account of accounts) {
        console.log(`Provider: ${account.provider}`)
        console.log(`Provider Account ID: ${account.providerAccountId}`)
        console.log(`Linked to User:`)
        console.log(`  - ID: ${account.user.id}`)
        console.log(`  - Email: ${account.user.email}`)
        console.log(`  - Name: ${account.user.name}`)
        console.log(`  - Role: ${account.user.role}`)
        console.log('---')
      }
    }

    // Check active sessions
    console.log('\nChecking active sessions:')
    const sessions = await prisma.session.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      where: {
        expires: {
          gt: new Date() // Only non-expired sessions
        }
      }
    })

    console.log(`Found ${sessions.length} active sessions:\n`)
    
    for (const session of sessions) {
      console.log(`Session ID: ${session.id}`)
      console.log(`User: ${session.user.email} (${session.user.name})`)
      console.log(`Expires: ${session.expires.toISOString()}`)
      console.log('---')
    }

    // Check for specific Google account conflict
    console.log('\nChecking for Google account conflicts:')
    const googleAccounts = await prisma.account.findMany({
      where: { provider: 'google' },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    for (const account of googleAccounts) {
      console.log(`Google Account ID: ${account.providerAccountId}`)
      console.log(`Linked to: ${account.user.email}`)
      
      // Check if this creates a mismatch
      if (account.providerAccountId === '110854878938819145804') {
        console.log(`⚠️  THIS IS THE PROBLEMATIC ACCOUNT!`)
        console.log(`  Google ID: 110854878938819145804`)
        console.log(`  Expected Google email: blckout26@gmail.com`)
        console.log(`  Actually linked to: ${account.user.email}`)
        
        if (account.user.email !== 'blckout26@gmail.com') {
          console.log(`❌ EMAIL MISMATCH! This is why Google OAuth fails.`)
        }
      }
    }

  } catch (error) {
    console.error('❌ Error checking accounts:', error)
  }
}

async function main() {
  await checkAccountLinks()
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
