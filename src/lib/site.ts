export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://dsonofsolomon.com";
export const DEFAULT_SOCIAL_IMAGE_PATH = "/admin-hero-sample.svg";

export function absoluteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function resolveSocialImage(image?: string | null) {
  if (!image) {
    return absoluteUrl(DEFAULT_SOCIAL_IMAGE_PATH);
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return absoluteUrl(image);
}
