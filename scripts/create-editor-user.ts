import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createEditorUser() {
  try {
    // console.log('Creating editor user...')
    // console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')
    
    const editorEmail = 'editor@pusaka.com'
    const editorPassword = 'editor123'
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: editorEmail }
    })
    
    if (existingUser) {
      // console.log('✅ Editor user already exists!')
      // console.log('Email:', existingUser.email)
      // console.log('Role:', existingUser.role)
      // console.log('Active:', existingUser.isActive)
      return
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(editorPassword, 12)
    
    // Create editor user
    const editorUser = await prisma.user.create({
      data: {
        name: 'Jane Editor',
        email: editorEmail,
        password: hashedPassword,
        role: 'EDITOR',
        subscriptionType: 'MONTHLY',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
        trialUsed: false,
      }
    })
    
    // console.log('✅ Editor user created successfully!')
    // console.log('Email:', editorUser.email)
    // console.log('Password: editor123')
    // console.log('Role:', editorUser.role)
    
  } catch (error) {
    // console.error('Error creating editor user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createEditorUser()
