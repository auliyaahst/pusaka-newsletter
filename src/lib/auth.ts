import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

// Configure NextAuth
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
    async jwt({ token, user }) {
      console.log('🔑 NextAuth JWT callback:', { 
        hasUser: !!user, 
        tokenId: token.id, 
        userRole: user?.role,
        tokenRole: token.role 
      })
      if (user) {
        token.id = user.id
        token.role = user.role
        console.log('✅ JWT token updated with user data:', { id: token.id, role: token.role })
      }
      return token
    },
    async session({ session, token }) {
      console.log('👤 NextAuth session callback:', { 
        hasToken: !!token, 
        hasSessionUser: !!session.user,
        tokenId: token.id,
        tokenRole: token.role 
      })
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        console.log('✅ Session updated with token data:', { 
          userId: session.user.id, 
          userRole: session.user.role,
          userEmail: session.user.email 
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