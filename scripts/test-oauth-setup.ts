import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testOAuthSetup() {
  console.log('🔍 Testing OAuth Setup and Database Connection...\n')

  try {
    // 1. Test database connection
    console.log('1. Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully\n')

    // 2. Check environment variables
    console.log('2. Checking OAuth environment variables...')
    const requiredEnvVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET', 
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ]

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar]
      if (value) {
        console.log(`✅ ${envVar}: ${envVar === 'NEXTAUTH_URL' ? value : '***set***'}`)
      } else {
        console.log(`❌ ${envVar}: NOT SET`)
      }
    }
    console.log('')

    // 3. Check for OAuth account conflicts
    console.log('3. Checking for potential OAuth conflicts...')
    
    // Find users with same email but different auth methods
    const users = await prisma.user.findMany({
      include: {
        accounts: true
      }
    })

    const emailGroups = users.reduce((acc, user) => {
      if (!acc[user.email]) acc[user.email] = []
      acc[user.email].push(user)
      return acc
    }, {} as Record<string, typeof users>)

    console.log(`Found ${users.length} total users in database`)
    
    let hasConflicts = false
    for (const [email, userList] of Object.entries(emailGroups)) {
      if (userList.length > 1) {
        hasConflicts = true
        console.log(`❌ CONFLICT: ${email} has ${userList.length} accounts`)
        for (const user of userList) {
          const hasPassword = !!user.password
          const hasOAuth = user.accounts.length > 0
          const oAuthProviders = user.accounts.map(acc => acc.provider).join(', ')
          console.log(`   - ID: ${user.id} | Password: ${hasPassword} | OAuth: ${oAuthProviders || 'None'}`)
        }
        console.log('')
      }
    }

    if (!hasConflicts) {
      console.log('✅ No email conflicts found\n')
    }

    // 4. Test creating a test OAuth account (dry run)
    console.log('4. Testing OAuth account creation (dry run)...')
    
    const testEmail = 'oauth-test@example.com'
    
    // Check if test user exists
    const existingTestUser = await prisma.user.findUnique({
      where: { email: testEmail },
      include: { accounts: true }
    })

    if (existingTestUser) {
      console.log(`Test user ${testEmail} already exists:`)
      console.log(`  - Role: ${existingTestUser.role}`)
      console.log(`  - Has password: ${!!existingTestUser.password}`)
      console.log(`  - OAuth accounts: ${existingTestUser.accounts.map(a => a.provider).join(', ') || 'None'}`)
    } else {
      console.log(`Test user ${testEmail} does not exist - OAuth creation would work`)
    }

    console.log('\n✅ OAuth diagnostic complete!')

  } catch (error) {
    console.error('❌ OAuth diagnostic error:', error)
    console.log('\nThis suggests:')
    console.log('1. Database connection issues')
    console.log('2. Environment variable problems')
    console.log('3. Prisma client not properly generated')
  }
}

async function main() {
  await testOAuthSetup()
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
