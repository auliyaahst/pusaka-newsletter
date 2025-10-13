import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin() {
  try {
    // console.log('Testing login flow for editor@pusaka.com...')
    
    const email = 'editor@pusaka.com'
    const password = 'editor123'
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // console.log('❌ User not found')
      return
    }

    // console.log('✅ User found:', {
    //   id: user.id,
    //   email: user.email,
    //   name: user.name,
    //   role: user.role,
    //   isActive: user.isActive
    // })

    if (!user.password) {
      // console.log('❌ User has no password set')
      return
    }

    // Check password
    const passwordValid = await bcrypt.compare(password, user.password)
    // console.log('Password validation:', passwordValid ? '✅ VALID' : '❌ INVALID')

    if (!user.isActive) {
      // console.log('❌ User account is inactive')
      return
    }

    // console.log('✅ Login should work! All checks passed.')

  } catch (error) {
    // console.error('Error testing login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()
