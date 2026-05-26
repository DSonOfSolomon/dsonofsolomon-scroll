import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "dsonofsolomon_admin";

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET;
}

function getAdminSessionToken() {
  const secret = getAdminSessionSecret();
  return secret ? encodeURIComponent(secret) : null;
}

function adminSessionMatches(cookieValue: string | undefined) {
  const sessionSecret = getAdminSessionSecret();
  const sessionToken = getAdminSessionToken();

  if (!cookieValue || !sessionSecret || !sessionToken) {
    return false;
  }

  const decodedCookieValue = decodeURIComponent(cookieValue);

  return (
    cookieValue === sessionToken ||
    cookieValue === sessionSecret ||
    decodedCookieValue === sessionToken ||
    decodedCookieValue === sessionSecret
  );
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

  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (sessionCookie){
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
