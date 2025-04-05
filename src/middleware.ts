import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req) {
  const token = await getToken({ req })
  const isAuth = !!token
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register") ||
    req.nextUrl.pathname.startsWith("/forgot-password") ||
    req.nextUrl.pathname.startsWith("/reset-password") ||
    req.nextUrl.pathname.startsWith("/verify-email")

  // Public pages that don't require authentication
  const isPublicPage = req.nextUrl.pathname === "/"

  // If it's an auth page and the user is already logged in,
  // redirect to dashboard
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // If it's not an auth page or public page and the user is not logged in,
  // redirect to login
  if (!isAuthPage && !isPublicPage && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Otherwise, continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes
    // - Static files (e.g. /favicon.ico)
    // - Public assets
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
}

