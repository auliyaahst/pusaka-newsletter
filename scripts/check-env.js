// console.log('Environment variables:')
// console.log('NODE_ENV:', process.env.NODE_ENV)
// console.log('DATABASE_URL:', process.env.DATABASE_URL)
// console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)

// Check which database is being used
if (process.env.DATABASE_URL?.includes('localhost')) {
  // console.log('✅ Using LOCAL database')
} else if (process.env.DATABASE_URL?.includes('prisma.io')) {
  // console.log('🌐 Using PRODUCTION Prisma database')
} else if (process.env.DATABASE_URL?.includes('railway')) {
  // console.log('🚂 Using Railway database')
} else {
  // console.log('❓ Unknown database connection')
}
