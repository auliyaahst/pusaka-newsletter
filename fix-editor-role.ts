import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateUserRole() {
  try {
    // Update the it.editor user role from CUSTOMER to EDITOR
    const updatedUser = await prisma.user.update({
      where: { email: 'it.editor@thepusaka.id' },
      data: { 
        role: 'EDITOR',
        updatedAt: new Date()
      }
    })

    console.log('✅ User role updated successfully:', {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name
    })
  } catch (error) {
    console.error('❌ Error updating user role:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserRole()
