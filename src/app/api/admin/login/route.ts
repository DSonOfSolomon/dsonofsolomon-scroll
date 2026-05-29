import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  getAdminSessionToken,
} from "@/lib/adminAuth";
import { enforceRateLimit } from "@/lib/rateLimit";

async function isValidAdminPassword(password: string) {
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (adminPasswordHash) {
    return bcrypt.compare(password, adminPasswordHash);
  }

  return Boolean(
    process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD
  );
}
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request, {
    prefix: "admin-login",
    limit: 5,
    window: "10 m",
  });

  if (limited) {
    return NextResponse.redirect(new URL("/admin/login?error=rate-limit", request.nextUrl.origin), 303);
  }

  const formData = await request.formData();
  const username = formData.get("username")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString().trim() ?? "";
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const sessionToken = await getAdminSessionToken();
  const validPassword = await isValidAdminPassword(password);

  if (!sessionToken || username !== adminUsername || !validPassword) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.nextUrl.origin), 303);
  }

  const response = NextResponse.redirect(new URL("/admin", request.nextUrl.origin), 303);
  response.cookies.set(ADMIN_COOKIE_NAME, sessionToken, adminCookieOptions);

  return response;
}
