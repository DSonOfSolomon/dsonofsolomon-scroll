export const PUSH_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BD3T-gnMA_C6wPMPSFypmeTw4Xz4g0Ey2PX9B3XzYG2Ye1yxQ7kfN3JJeqnrWpPrTH7GE96CtRwJILfalVYy6yg";

export function getPushSubscriptionOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: base64UrlToUint8Array(PUSH_PUBLIC_KEY),
  };
}

function base64UrlToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);

  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}
