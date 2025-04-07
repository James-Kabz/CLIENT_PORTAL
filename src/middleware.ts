import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req : NextRequest) {
  const token = await getToken({ req })
  const isAuth = !!token
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register") ||
    req.nextUrl.pathname.startsWith("/forgot-password") ||
    req.nextUrl.pathname.startsWith("/reset-password") ||
    req.nextUrl.pathname.startsWith("/verify-email") ||
    req.nextUrl.pathname.startsWith("/resend-verification") ||
    req.nextUrl.pathname.startsWith("/auth-error")

  // Public pages that don't require authentication
  const isPublicPage = req.nextUrl.pathname === "/"

  // Check if email is verified
  const isEmailVerified = token?.emailVerified

  // If user is logged in but email is not verified, only allow access to verification pages
  if (
    isAuth &&
    !isEmailVerified &&
    !req.nextUrl.pathname.startsWith("/verify-email") &&
    !req.nextUrl.pathname.startsWith("/resend-verification") &&
    !req.nextUrl.pathname.startsWith("/api/auth/verify") &&
    !req.nextUrl.pathname.startsWith("/api/auth/resend-verification")
  ) {
    return NextResponse.redirect(new URL("/auth-error?error=Verification", req.url))
  }

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

