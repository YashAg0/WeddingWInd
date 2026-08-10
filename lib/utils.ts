import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strictly sanitizes redirect URLs to allow only internal relative paths starting with '/'.
 * Blocks open redirect attempts (e.g., protocol-relative URLs starting with '//' or URLs containing '://').
 */
export function sanitizeRedirectUrl(url: string | null | undefined, fallback = "/dashboard"): string {
  if (!url || typeof url !== "string") {
    return fallback;
  }
  const trimmed = url.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://")) {
    return fallback;
  }
  return trimmed;
}

