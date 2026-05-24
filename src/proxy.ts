import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "dsonofsolomon_admin";

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD;
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

  const sessionSecret = getAdminSessionSecret();
  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (sessionSecret && sessionCookie === sessionSecret) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
