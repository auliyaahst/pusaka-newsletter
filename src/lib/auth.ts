import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  logger: {
    error(code, ...message) {
      console.error('NextAuth Error:', code, ...message);
    },
    warn(code, ...message) {
      console.warn('NextAuth Warning:', code, ...message);
    },
    debug(code, ...message) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('NextAuth Debug:', code, ...message);
      }
    }
  },
  events: {
    async createUser({ user }) {
      console.log('New user created:', {
        id: user.id,
        name: user.name,
        email: user.email,
        env: process.env.NODE_ENV
      });
      
      // Verify in database
      try {
        const savedUser = await prisma.user.findUnique({
          where: { email: user.email ?? '' },
          include: { accounts: true }
        });
        console.log('User verification in database:', {
          exists: !!savedUser,
          hasAccounts: savedUser?.accounts.length ?? 0,
          env: process.env.NODE_ENV
        });
      } catch (error) {
        console.error('Error verifying user in database:', error);
      }
    },
    async signIn({ user, account, isNewUser }) {
      console.log('Sign in event:', {
        email: user.email,
        provider: account?.provider,
        isNewUser,
        env: process.env.NODE_ENV
      });
    }
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "CUSTOMER",
        }
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // For Google Sign In
        if (account?.provider === "google") {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email ?? '' },
            include: { accounts: true }
          });

          console.log('Google Sign In Check:', {
            email: user.email,
            isNewUser: !existingUser,
            accountsCount: existingUser?.accounts.length ?? 0,
            env: process.env.NODE_ENV
          });
        }
      } catch (error) {
        console.error('Error in signIn callback:', error);
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.role = user.role;
        if (account?.provider === "google") {
          token.googleId = profile?.sub; // Store Google ID in token
        }
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role,
          googleId: token.googleId, // Include Google ID in session
        }
      }
    },
  },
  pages: {
    signIn: "/login"
  },
}