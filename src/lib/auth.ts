import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  logger: {
    error(code, ...message) {
      // console.error('NextAuth Error:', code, ...message);
    },
    warn(code, ...message) {
      // console.warn('NextAuth Warning:', code, ...message);
    },
    debug(code, ...message) {
      // console.log('NextAuth Debug:', code, ...message);
    },
  },
});