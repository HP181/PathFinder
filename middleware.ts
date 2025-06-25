import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/register", "/about", "/contact", "/privacy", "/terms"]

  const isPublicPath = publicPaths.includes(path) || path.startsWith("/api/auth")

  // Get the user token from cookies
  const token = request.cookies.get("auth-token")?.value

  // Optional: Add token validation logic here
  // const isValidToken = validateToken(token);

  // If the user is not authenticated and trying to access a protected route
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url)
    // Add the original URL as a redirect parameter
    loginUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(loginUrl)
  }

  // If the user is authenticated and trying to access auth pages
  if (token && (path === "/login" || path === "/register")) {
    // Check if there's a redirect parameter
    const redirectTo = request.nextUrl.searchParams.get("redirect") || "/immigrant/profile"
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  // Add security headers
  const response = NextResponse.next()

  // Set security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "origin-when-cross-origin")

  return response
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - API routes that don't require auth
     * - Static files (_next/static, _next/image)
     * - Favicon and other assets
     * - Images directory
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|images|robots.txt|sitemap.xml).*)",
  ],
}
