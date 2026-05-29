import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, adminSessionMatches } from "@/lib/adminAuth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.nextUrl.hostname === "www.dsonofsolomon.com") {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.hostname = "dsonofsolomon.com";

    return NextResponse.redirect(canonicalUrl);
  }

  if (
    pathname.startsWith("/api/admin/login") ||
    pathname.startsWith("/api/admin/logout") ||
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
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
