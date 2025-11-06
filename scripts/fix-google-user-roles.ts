import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Define which emails should have which roles
const roleAssignments = {
  'admin@pusaka.com': 'ADMIN',
  'superadmin@pusaka.com': 'SUPER_ADMIN', 
  'editor@pusaka.com': 'EDITOR',
  'publisher@pusaka.com': 'PUBLISHER'
}

async function fixRoles() {
  try {
    console.log('🔧 Fixing Google OAuth user roles...')
    
    for (const [email, role] of Object.entries(roleAssignments)) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          accounts: {
            select: { provider: true }
          }
        }
      })
      
      if (user) {
        const hasGoogleAccount = user.accounts.some(acc => acc.provider === 'google')
        
        if (!user.role || user.role !== role) {
          await prisma.user.update({
            where: { email },
            data: {
              role: role as any,
              isActive: true,
              isVerified: true
            }
          })
          
          console.log(`✅ Updated ${email}: Role = ${role}, Google OAuth = ${hasGoogleAccount}`)
        } else {
          console.log(`✓ ${email}: Already has correct role ${role}`)
        }
      } else {
        console.log(`⚠️  User not found: ${email}`)
      }
    }
    
    console.log('\n🎯 Role assignment complete!')
    
  } catch (error) {
    console.error('❌ Error fixing roles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixRoles()
