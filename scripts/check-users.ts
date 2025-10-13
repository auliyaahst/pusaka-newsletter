import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      }
    })
    
    // console.log('Users in database:')
    // users.forEach(user => {
    //   console.log(`- ${user.name} (${user.email}) - Role: ${user.role} - Active: ${user.isActive}`)
    // })
    
    const editorUser = await prisma.user.findUnique({
      where: { email: 'editor@pusaka.com' }
    })
    
    if (editorUser) {
      // console.log('\nEditor user found!')
      // console.log('You can login with:')
      // console.log('Email: editor@pusaka.com')
      // console.log('Password: editor123')
    } else {
      // console.log('\nEditor user NOT found!')
    }
    
  } catch (error) {
    // console.error('Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
