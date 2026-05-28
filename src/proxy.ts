import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, adminSessionMatches } from "@/lib/adminAuth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    !pathname.startsWith("/admin") ||
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/logout")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (await adminSessionMatches(sessionCookie)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
