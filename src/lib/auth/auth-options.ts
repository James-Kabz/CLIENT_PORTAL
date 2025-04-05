import { PrismaAdapter } from "@auth/prisma-adapter"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcrypt"

import { db } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            organization: true,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          organizationSlug: user.organization?.slug,
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.name = token.name
        session.user.email = token.email
        session.user.role = token.role as string
        session.user.organizationId = token.organizationId as string
        session.user.organizationSlug = token.organizationSlug as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.organizationId = user.organizationId
        token.organizationSlug = user.organizationSlug
      } else if (token.email) {
        // Refresh user data on each token refresh
        const dbUser = await db.user.findUnique({
          where: {
            email: token.email,
          },
          include: {
            organization: true,
          },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.organizationId = dbUser.organizationId
          token.organizationSlug = dbUser.organization?.slug
        }
      }
      return token
    },
  },
}

