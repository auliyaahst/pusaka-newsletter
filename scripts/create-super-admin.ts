import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    console.log('🚀 Creating Super Admin user...')
    
    const email = 'superadmin@pusaka.com'
    const password = 'superadmin123'
    const name = 'Super Admin'
    
    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingSuperAdmin) {
      console.log('⚠️ Super Admin user already exists:', email)
      console.log('🔄 Updating existing Super Admin...')
      
      const hashedPassword = await bcrypt.hash(password, 12)
      
      await prisma.user.update({
        where: { email },
        data: {
          name,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isVerified: true,
          isActive: true,
          updatedAt: new Date()
        }
      })
      
      console.log('✅ Super Admin user updated successfully!')
    } else {
      const hashedPassword = await bcrypt.hash(password, 12)
      
      const superAdmin = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          subscriptionType: 'ANNUALLY', // Give full subscription
          subscriptionStart: new Date(),
          subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          isActive: true,
          isVerified: true,
        }
      })
      
      console.log('✅ Super Admin user created successfully!')
      console.log('📧 Email:', superAdmin.email)
      console.log('🔑 Password:', password)
      console.log('👤 Role:', superAdmin.role)
    }
    
    console.log('')
    console.log('🎯 Super Admin Credentials:')
    console.log('📧 Email: superadmin@pusaka.id')
    console.log('🔑 Password: superadmin123')
    console.log('👑 Role: SUPER_ADMIN')
    console.log('')
    console.log('🌟 Super Admin can access all dashboards and perform all actions!')
    
  } catch (error) {
    console.error('❌ Error creating Super Admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()
