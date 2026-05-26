import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const ADMIN_COOKIE_NAME = "dsonofsolomon_admin";

const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET;
}

function getAdminSessionToken() {
  const secret = getAdminSessionSecret();
  return secret ? encodeURIComponent(secret) : null;
}

async function isValidAdminPassword(password: string) {
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminPasswordHash) {
    return false;
  }

  return bcrypt.compare(password, adminPasswordHash);
}

export async function POST(request: NextRequest) {
  console.log("ADMIN LOGIN ROUTE HIT");
  console.log("ADMIN_USERNAME exists:", Boolean(process.env.ADMIN_USERNAME));
  console.log(
    "ADMIN_PASSWORD_HASH exists:",
    Boolean(process.env.ADMIN_PASSWORD_HASH)
  );
  console.log(
    "ADMIN_SESSION_SECRET exists:",
    Boolean(process.env.ADMIN_SESSION_SECRET)
  );
  const formData = await request.formData();

  const username = formData.get("username")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString().trim() ?? "";

  const adminUsername = process.env.ADMIN_USERNAME;
  const sessionToken = getAdminSessionToken();
  const validPassword = await isValidAdminPassword(password);

  if (!sessionToken || username !== adminUsername || !validPassword) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }

  const response = NextResponse.redirect(new URL("/admin", request.url));

  response.cookies.set(ADMIN_COOKIE_NAME, sessionToken, adminCookieOptions);

  return response;
}
