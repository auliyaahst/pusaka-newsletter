import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkUserAndPassword() {
  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email: 'ahnyjn193@gmail.com' }
    })

    if (!user) {
      console.log('❌ User ahnyjn193@gmail.com not found')
      
      // Let's see what users DO exist
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true, role: true, isActive: true, isVerified: true }
      })
      
      console.log('\n📋 Existing users:')
      allUsers.forEach(u => {
        console.log(`- ${u.email} | ${u.name} | ${u.role} | Active: ${u.isActive} | Verified: ${u.isVerified}`)
      })
      
      return
    }

    console.log('✅ User found:', {
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
      hasPassword: !!user.password
    })

    // Test password if it exists
    if (user.password) {
      // Test some common passwords that might have been set
      const testPasswords = ['password', '123456', 'admin123', 'test123', user.email]
      
      for (const testPwd of testPasswords) {
        const isValid = await bcrypt.compare(testPwd, user.password)
        if (isValid) {
          console.log(`✅ Password '${testPwd}' is valid for this user`)
          break
        } else {
          console.log(`❌ Password '${testPwd}' is NOT valid`)
        }
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserAndPassword()
