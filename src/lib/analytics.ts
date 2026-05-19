export const READING_MILESTONES = [25, 50, 75, 100] as const;

export function isTrackablePath(pathname: string) {
  return !pathname.startsWith("/admin") && !pathname.startsWith("/api");
}
