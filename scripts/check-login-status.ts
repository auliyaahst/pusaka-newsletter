import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkLoginStatus() {
  try {
    console.log('\n🔍 Checking all user accounts...\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        password: true
      }
    })

    if (users.length === 0) {
      console.log('❌ No users found in the database!')
      return
    }

    console.log(`Found ${users.length} user(s):\n`)

    for (const user of users) {
      console.log(`📧 Email: ${user.email}`)
      console.log(`👤 Name: ${user.name}`)
      console.log(`🎭 Role: ${user.role}`)
      console.log(`${user.isActive ? '✅' : '❌'} Active: ${user.isActive}`)
      console.log(`${user.password ? '✅' : '❌'} Has Password: ${user.password ? 'Yes' : 'No'}`)
      
      // Test password if you want to verify a specific account
      // Uncomment and modify these lines to test:
      // if (user.email === 'admin@pusaka.com') {
      //   const testPassword = 'admin123'
      //   const isValid = await bcrypt.compare(testPassword, user.password || '')
      //   console.log(`🔐 Password test for '${testPassword}': ${isValid ? '✅ Valid' : '❌ Invalid'}`)
      // }
      
      console.log('─'.repeat(50))
    }

    console.log('\n💡 Tips:')
    console.log('- Make sure the email and password match exactly')
    console.log('- Check that isActive is true')
    console.log('- Verify the user has a password set')
    console.log('\n')

  } catch (error) {
    console.error('❌ Error checking login status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLoginStatus()
