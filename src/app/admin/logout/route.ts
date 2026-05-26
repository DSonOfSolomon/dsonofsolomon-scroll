import { NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "dsonofsolomon_admin";

export async function GET() {
  const response = NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL));

  response.cookies.delete(ADMIN_COOKIE_NAME);

  return response;
}