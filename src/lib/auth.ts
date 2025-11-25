import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import type { Adapter } from "next-auth/adapters"

// Custom PrismaAdapter with default user values for OAuth signups
function CustomPrismaAdapter(p: typeof prisma): Adapter {
  const adapter = PrismaAdapter(p)
  
  return {
    ...adapter,
    async createUser(user: { id?: string; name?: string | null; email: string; emailVerified?: Date | null; image?: string | null }) {
      console.log('🆕 CustomPrismaAdapter - Creating user with OAuth defaults:', user)
      
      // Check if user already exists (might have been created via manual registration)
      const existingUser = await p.user.findUnique({
        where: { email: user.email }
      })
      
      if (existingUser) {
        console.log('👤 CustomPrismaAdapter - User already exists, updating OAuth info:', {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role
        })
        
        // Update existing user with OAuth info but preserve role and subscription
        const updatedUser = await p.user.update({
          where: { email: user.email },
          data: {
            name: user.name || existingUser.name,
            image: user.image || existingUser.image,
            emailVerified: user.emailVerified || existingUser.emailVerified,
            isVerified: true, // OAuth accounts are pre-verified
          }
        })
        
        console.log('✅ CustomPrismaAdapter - Existing user updated, role preserved:', {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role
        })
        
        return {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          emailVerified: updatedUser.emailVerified,
          image: updatedUser.image,
        }
      }
      
      // Add default values for NEW OAuth users only
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        // Add our custom defaults
        subscriptionType: 'FREE_TRIAL' as const,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000), // 3 months
        role: 'CUSTOMER' as const,
        isActive: true,
        isVerified: true, // OAuth accounts are pre-verified
      }
      
      const createdUser = await p.user.create({ data: userData })
      console.log('✅ CustomPrismaAdapter - New user created:', { 
        id: createdUser.id, 
        email: createdUser.email, 
        role: createdUser.role 
      })
      
      return {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        emailVerified: createdUser.emailVerified,
        image: createdUser.image,
      }
    }
  }
}

// Configure NextAuth
import fs from 'node:fs'
import path from 'node:path'

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Allow linking OAuth to existing accounts
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔐 Authorize called with email:", credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          throw new Error("Invalid credentials")
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          console.log("👤 User found:", user ? "Yes" : "No")

          if (!user) {
            console.log("❌ User not found")
            throw new Error("Invalid credentials")
          }

          // Check for OTP-verified login (special case)
          if (credentials.password === 'verified') {
            console.log("🔓 OTP-verified login detected")
            if (!user.isVerified) {
              console.log("❌ User not verified")
              throw new Error("Account not verified")
            }
            if (!user.isActive) {
              console.log("❌ User not active")
              throw new Error("Account is not active")
            }
            console.log("✅ OTP-verified authentication successful for:", user.email)
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          }

          // Regular password login
          if (!user.password) {
            console.log("❌ No password set")
            throw new Error("Invalid credentials")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log("🔑 Password valid:", isPasswordValid)

          if (!isPasswordValid) {
            console.log("❌ Invalid password")
            throw new Error("Invalid credentials")
          }

          if (!user.isActive) {
            console.log("❌ User not active")
            throw new Error("Account is not active")
          }

          console.log("✅ Authentication successful for:", user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("💥 Auth error:", error)
          throw error
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔐 SignIn callback:', { 
        email: user.email, 
        provider: account?.provider,
        profileEmail: profile?.email 
      })
      
      if (account?.provider === 'google') {
        try {
          // Find existing user in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          
          console.log('👤 Google OAuth - User lookup:', { 
            email: user.email, 
            userExists: !!existingUser,
            userRole: existingUser?.role 
          })
          
          if (existingUser) {
            // Update user info but preserve role and subscription
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                isVerified: true
              }
            })
            console.log('✅ Google OAuth - Existing user updated')
          } else {
            console.log('🆕 Google OAuth - New user will be created by custom adapter')
          }
          
          return true // Allow all Google OAuth sign-ins
        } catch (error) {
          console.error('❌ Google OAuth error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      console.log('🔑 NextAuth JWT callback:', { 
        hasUser: !!user, 
        tokenId: token.id, 
        userRole: user?.role,
        tokenRole: token.role,
        provider: account?.provider,
        tokenIat: token.iat
      })
      
      // Check for global session invalidation
      try {
        const invalidationFile = path.join(process.cwd(), '.session-invalidation')
        
        if (fs.existsSync(invalidationFile)) {
          const invalidationTime = Number.parseInt(fs.readFileSync(invalidationFile, 'utf8'))
          const tokenCreationTime = (token.iat as number) * 1000 // Convert to milliseconds
          
          if (tokenCreationTime < invalidationTime) {
            console.warn('🚫 Token created before global invalidation time, rejecting')
            return { ...token, invalidSession: true, forceLogout: true }
          }
        }
      } catch (error) {
        console.log('📝 No invalidation file found or error reading it:', (error as Error).message)
      }
      
      if (user) {
        token.id = user.id
        token.role = user.role
        console.log('✅ JWT token updated with user data:', { id: token.id, role: token.role })
      } else if (token.email) {
        // Always fetch role from database to ensure it's up-to-date (especially for Google OAuth)
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true, role: true, isActive: true, isVerified: true }
          })
          
          console.log('🔍 JWT - Fetched user from DB:', { 
            email: token.email, 
            role: dbUser?.role,
            isActive: dbUser?.isActive 
          })
          
          if (dbUser?.isActive) {
            token.id = dbUser.id
            token.role = dbUser.role
            token.isActive = dbUser.isActive
            token.isVerified = dbUser.isVerified
            console.log('✅ JWT token updated with DB data:', { id: token.id, role: token.role })
          } else {
            // User doesn't exist or is inactive - force logout
            console.warn('🚫 User not found or inactive, invalidating token:', token.email)
            return { ...token, invalidSession: true, forceLogout: true }
          }
        } catch (error) {
          console.error('❌ JWT DB lookup error:', error)
          return { ...token, invalidSession: true, forceLogout: true }
        }
      } else {
        // No user and no email - invalid token
        console.warn('🚫 JWT token has no user or email, invalidating')
        return { ...token, invalidSession: true, forceLogout: true }
      }
      
      return token
    },
    async session({ session, token }) {
      console.log('👤 NextAuth session callback:', { 
        hasToken: !!token, 
        hasSessionUser: !!session.user,
        tokenId: token.id,
        tokenRole: token.role,
        tokenIsActive: token.isActive,
        invalidSession: token.invalidSession,
        forceLogout: token.forceLogout
      })
      
      // Check for invalid session flags
      if (token.invalidSession || token.forceLogout) {
        console.warn('🚫 Invalid/forced logout session detected, forcing error')
        throw new Error('Session invalidated')
      }
      
      // Validate that we have required token data
      if (!token.id || !token.email || token.isActive === false) {
        console.warn('🚫 Missing required token data or user inactive, invalidating session')
        throw new Error('Session invalid')
      }
      
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role
        session.user.isActive = token.isActive
        session.user.isVerified = token.isVerified
        console.log('✅ Session updated with token data:', { 
          userId: session.user.id, 
          userRole: session.user.role,
          userEmail: session.user.email,
          isActive: session.user.isActive 
        })
      }
      return session
    },
  },
  debug: true,
  logger: {
    error(code, ...message) {
      console.error("NextAuth Error:", code, ...message)
    },
    warn(code, ...message) {
      console.warn("NextAuth Warning:", code, ...message)
    },
    debug(code, ...message) {
      console.debug("NextAuth Debug:", code, ...message)
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)