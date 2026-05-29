export const ADMIN_COOKIE_NAME = "dsonofsolomon_admin";

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export const adminCookieDeleteOptions = {
  path: adminCookieOptions.path,
};

function getCookieDomain(hostname?: string | null) {
  if (
    process.env.NODE_ENV === "production" &&
    (hostname === "dsonofsolomon.com" || hostname === "www.dsonofsolomon.com")
  ) {
    return ".dsonofsolomon.com";
  }

  return undefined;
}

export function getAdminCookieOptions(hostname?: string | null) {
  return {
    ...adminCookieOptions,
    domain: getCookieDomain(hostname),
  };
}

export function getAdminCookieDeleteOptions(hostname?: string | null) {
  return {
    ...adminCookieDeleteOptions,
    domain: getCookieDomain(hostname),
  };
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET;
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function safelyDecodeCookieValue(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function getAdminSessionToken() {
  const secret = getAdminSessionSecret();

  if (!secret) {
    return null;
  }

  const input = new TextEncoder().encode(`admin-session:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", input);

  return `v1.${base64UrlEncode(new Uint8Array(digest))}`;
}

export async function adminSessionMatches(cookieValue: string | undefined) {
  const sessionToken = await getAdminSessionToken();

  if (!cookieValue || !sessionToken) {
    return false;
  }

  return (
    cookieValue === sessionToken ||
    safelyDecodeCookieValue(cookieValue) === sessionToken
  );
}
