import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const normalizedEmail = credentials.email.trim().toLowerCase();

        const user = await db.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          businessName: user.businessName,
          emailVerified: Boolean(user.emailVerifiedAt),
          phoneVerified: Boolean(user.phoneVerifiedAt),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.businessName = (user as any).businessName;
        token.emailVerified = Boolean((user as any).emailVerified);
        token.phoneVerified = Boolean((user as any).phoneVerified);
      }

      if (token.id) {
        const currentUser = await db.user.findUnique({
          where: { id: token.id },
          select: { emailVerifiedAt: true, phoneVerifiedAt: true },
        });

        token.emailVerified = Boolean(currentUser?.emailVerifiedAt);
        token.phoneVerified = Boolean(currentUser?.phoneVerifiedAt);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).businessName = token.businessName;
        (session.user as any).emailVerified = Boolean(token.emailVerified);
        (session.user as any).phoneVerified = Boolean(token.phoneVerified);
      }
      return session;
    },
  },
};
