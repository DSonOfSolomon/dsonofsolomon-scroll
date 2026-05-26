import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "dsonofsolomon_admin";

function getAdminSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.ADMIN_PASSWORD_HASH ??
    process.env.ADMIN_PASSWORD
  );
}

function getAdminSessionToken() {
  const secret = getAdminSessionSecret();
  return secret ? encodeURIComponent(secret) : null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    !pathname.startsWith("/admin") ||
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/logout")
  ) {
    return NextResponse.next();
  }

  const sessionToken = getAdminSessionToken();
  const sessionSecret = getAdminSessionSecret();
  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (
    sessionToken &&
    sessionCookie &&
    (sessionCookie === sessionToken || sessionCookie === sessionSecret)
  ) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
