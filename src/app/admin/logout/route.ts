import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  getAdminCookieDeleteOptions,
} from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));

  response.cookies.delete({
    name: ADMIN_COOKIE_NAME,
    ...getAdminCookieDeleteOptions(request.nextUrl.hostname),
  });

  return response;
}
