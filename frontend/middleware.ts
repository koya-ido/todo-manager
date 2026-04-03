import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_PATHS = ["/home", "/inbox", "/private", "/team", "/user"];
const LOGIN_PATH = "/login";
const DEFAULT_AUTHENTICATED_PATH = "/home";

const isProtectedPath = (pathname: string) =>
  PROTECTED_PATHS.some(
    (protectedPath) =>
      pathname === protectedPath || pathname.startsWith(`${protectedPath}/`),
  );

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  if (!accessToken && isProtectedPath(pathname)) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (accessToken && pathname === LOGIN_PATH) {
    const authenticatedUrl = new URL(DEFAULT_AUTHENTICATED_PATH, request.url);
    return NextResponse.redirect(authenticatedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/home/:path*",
    "/inbox/:path*",
    "/private/:path*",
    "/team/:path*",
    "/user/:path*",
  ],
};
