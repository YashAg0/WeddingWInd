/**
 * Client-side Device Identifier Manager
 * Ensures all tabs and windows on the same browser/device share the exact same deviceId.
 */

const DEVICE_ID_KEY = "wwi_device_id";

export function getOrCreateClientDeviceId(): string {
  if (typeof window === "undefined") {
    return "server-ssr-device";
  }

  try {
    // 1. Try reading from localStorage
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);

    // 2. If not in localStorage, check cookie
    if (!deviceId) {
      const match = document.cookie.match(new RegExp("(^| )" + DEVICE_ID_KEY + "=([^;]+)"));
      if (match) {
        deviceId = decodeURIComponent(match[2]);
      }
    }

    // 3. If still not found, generate a fresh persistent UUID
    if (!deviceId) {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        deviceId = crypto.randomUUID();
      } else {
        deviceId = "dev_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      }
    }

    // 4. Synchronize across both localStorage and cookie
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
    document.cookie = `${DEVICE_ID_KEY}=${encodeURIComponent(deviceId)}; Path=/; Max-Age=31536000; SameSite=Lax`;

    return deviceId;
  } catch (err) {
    console.warn("Failed to access localStorage/cookie for deviceId:", err);
    return "fallback-device-" + Date.now();
  }
}

export function getClientDeviceName(): string {
  if (typeof navigator === "undefined") return "Web Browser";

  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return "iPhone (Mobile)";
  if (/iPad/i.test(ua)) return "iPad (Tablet)";
  if (/Android/i.test(ua)) return "Android Device";
  if (/Macintosh/i.test(ua)) return "Mac (macOS)";
  if (/Windows/i.test(ua)) return "Windows PC";
  if (/Linux/i.test(ua)) return "Linux Device";
  return "Web Browser";
}
