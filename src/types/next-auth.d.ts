import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      role: string
      organizationId: string
      organizationSlug: string
      emailVerified?: Date | null
    } & DefaultSession["user"]
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    role?: UserRole | null
    organizationId?: string | null
    organizationSlug?: string
    emailVerified?: Date | null
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    id: string
    role?: string | null
    organizationId?: string | null
    organizationSlug?: string 
    emailVerified?: Date | null
  }
}