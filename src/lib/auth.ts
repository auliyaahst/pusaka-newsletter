import { Ne  logger: {
    error(code, ...message) {
      // console.error('NextAuth Error:', code, ...message);
    },
    warn(code, ...message) {
      // console.warn('NextAuth Warning:', code, ...message);
    },
    debug(code, ...message) {
      // if (process.env.NODE_ENV === 'development') {
      //   console.log('NextAuth Debug:', code, ...message);
      // }
    }
  }, } from "next-auth"
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
      // console.log('New user created:', {
      //   id: user.id,
      //   name: user.name,
      //   email: user.email,
      //   env: process.env.NODE_ENV
      // });
      
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
      // console.log('Sign in event:', {
      //   email: user.email,
      //   provider: account?.provider,
      //   isNewUser,
      //   env: process.env.NODE_ENV
      // });
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
    strategy: "jwt",
    maxAge: 15 * 60, // 2 minutes for testing (change back to 15 * 60 for production)
    updateAge: 0, // Don't update session automatically
  },
  callbacks: {
    async signIn({ user, account }) {
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
      const now = Math.floor(Date.now() / 1000);
      
      if (user) {
        // User just signed in, set initial token data
        token.role = user.role;
        token.loginTime = now;
        if (account?.provider === "google") {
          token.googleId = profile?.sub;
        }
      }
      
      // Check if token should expire (2 minutes for testing)
      const loginTime = token.loginTime as number || now;
      const sessionTimeout = 15 * 60; // 15 minutes in seconds
      
      if (now - loginTime > sessionTimeout) {
        // Session has expired, return expired token
        return {
          ...token,
          expired: true
        };
      }
      
      return token;
    },
    async session({ session, token }) {
      // Check if token is marked as expired
      if (token.expired) {
        throw new Error('Session expired');
      }
      
      // Additional time check in session callback
      const now = Math.floor(Date.now() / 1000);
      const loginTime = token.loginTime as number || now;
      const sessionTimeout = 15 * 60; // 15 minutes in seconds

      if (now - loginTime > sessionTimeout) {
        throw new Error('Session expired');
      }
      
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role,
          googleId: token.googleId,
        }
      }
    },
  },
  pages: {
    signIn: "/login"
  },
}