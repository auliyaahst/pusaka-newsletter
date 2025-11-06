import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Checking all users in database...')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isVerified: true,
        accounts: {
          select: {
            provider: true,
            type: true
          }
        }
      }
    })
    
    console.log(`\n📊 Found ${users.length} users:`)
    console.log('=' .repeat(80))
    
    for (const [index, user] of users.entries()) {
      console.log(`\n${index + 1}. ${user.name || 'No Name'} (${user.email})`)
      console.log(`   🎭 Role: ${user.role || 'No Role'}`)
      console.log(`   ✅ Active: ${user.isActive}`)
      console.log(`   ✉️  Verified: ${user.isVerified}`)
      console.log(`   🔗 Accounts: ${user.accounts.map(acc => acc.provider).join(', ') || 'None'}`)
    }
    
    // Check for users with Google accounts but no role
    const googleUsersWithoutRole = users.filter(user => 
      user.accounts.some(acc => acc.provider === 'google') && !user.role
    )
    
    if (googleUsersWithoutRole.length > 0) {
      console.log('\n⚠️  Google users without roles:')
      for (const user of googleUsersWithoutRole) {
        console.log(`   - ${user.email} (${user.name})`)
      }
    }
    
    console.log('\n🎯 Summary:')
    console.log(`   Total users: ${users.length}`)
    console.log(`   With roles: ${users.filter(u => u.role).length}`)
    console.log(`   Without roles: ${users.filter(u => !u.role).length}`)
    console.log(`   Google OAuth: ${users.filter(u => u.accounts.some(acc => acc.provider === 'google')).length}`)
    console.log(`   Credentials: ${users.filter(u => u.accounts.length === 0).length}`)
    
  } catch (error) {
    console.error('❌ Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
