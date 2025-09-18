import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkEditorUser() {
  try {
    console.log('Checking for editor user...')
    
    const editorUser = await prisma.user.findUnique({
      where: {
        email: 'editor@pusaka.com'
      }
    })

    if (editorUser) {
      console.log('✅ Editor user found!')
      console.log('Email:', editorUser.email)
      console.log('Name:', editorUser.name)
      console.log('Role:', editorUser.role)
      console.log('Active:', editorUser.isActive)
      
      // Check if password is set
      if (editorUser.password) {
        console.log('✅ Password is set')
        
        // Test the password
        const passwordMatch = await bcrypt.compare('editor123', editorUser.password)
        console.log('Password "editor123" matches:', passwordMatch ? '✅ YES' : '❌ NO')
      } else {
        console.log('❌ No password set')
      }
    } else {
      console.log('❌ Editor user not found')
    }

    // List all users
    console.log('\n--- All users in database ---')
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        isActive: true,
        password: true
      }
    })

    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.role} - Active: ${user.isActive} - Has Password: ${!!user.password}`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkEditorUser()
