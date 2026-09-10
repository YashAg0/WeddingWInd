/**
 * lib/client-cache.ts
 *
 * Resilient, high-performance client-side storage & memory caching layer.
 * Provides instant hydration for user profiles, wishlist, notifications,
 * and wedding discovery data across page navigation and refreshes.
 */

import type { User, Notification } from "@/context/AuthContext";
import type { Wedding } from "@/types";

const USER_CACHE_KEY = "wwi_cached_user_v1";
const DASH_CACHE_KEY = "wwi_cached_dash_v1";
const WEDDINGS_SESSION_KEY = "wwi_weddings_session_v1";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEnvelope<T> {
  data: T;
  timestamp: number;
}

export interface DashboardCache {
  wishlist: string[];
  notifications: Notification[];
  unreadCount: number;
}

/** In-memory cache fallback for fast page transitions */
const memoryCache: {
  user: User | null;
  dash: DashboardCache | null;
  weddings: Wedding[] | null;
} = {
  user: null,
  dash: null,
  weddings: null,
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Check client cookies for Clerk session tokens before Clerk SDK fully loads */
export function hasClerkSessionCookie(): boolean {
  if (!isBrowser()) return false;
  try {
    const cookies = document.cookie;
    if (!cookies) return false;
    // Clerk sets __client_uat and/or __session
    const hasSession = cookies.includes("__session=");
    const matchUat = cookies.match(/__client_uat=([^;]+)/);
    const uatValue = matchUat ? matchUat[1]?.trim() : null;
    const hasActiveUat = Boolean(uatValue && uatValue !== "0");
    return hasSession || hasActiveUat;
  } catch {
    return false;
  }
}

/** Safe localStorage getter with TTL check */
export function getCachedUser(): User | null {
  if (memoryCache.user) return memoryCache.user;
  if (!isBrowser()) return null;

  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    const parsed: CacheEnvelope<User> = JSON.parse(raw);
    if (!parsed || !parsed.data) return null;

    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(USER_CACHE_KEY);
      return null;
    }

    memoryCache.user = parsed.data;
    return parsed.data;
  } catch (err) {
    console.warn("[client-cache] Failed to read cached user:", err);
    return null;
  }
}

/** Safe localStorage setter for user profile */
export function setCachedUser(user: User): void {
  memoryCache.user = user;
  if (!isBrowser()) return;

  try {
    const envelope: CacheEnvelope<User> = {
      data: user,
      timestamp: Date.now(),
    };
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(envelope));
  } catch (err) {
    console.warn("[client-cache] Failed to save user to cache:", err);
  }
}

/** Clear cached user profile */
export function clearCachedUser(): void {
  memoryCache.user = null;
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(USER_CACHE_KEY);
  } catch (err) {
    console.warn("[client-cache] Failed to clear user cache:", err);
  }
}

/** Safe localStorage getter for dashboard metadata */
export function getCachedDashboardData(): DashboardCache | null {
  if (memoryCache.dash) return memoryCache.dash;
  if (!isBrowser()) return null;

  try {
    const raw = localStorage.getItem(DASH_CACHE_KEY);
    if (!raw) return null;
    const parsed: CacheEnvelope<DashboardCache> = JSON.parse(raw);
    if (!parsed || !parsed.data) return null;

    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(DASH_CACHE_KEY);
      return null;
    }

    memoryCache.dash = parsed.data;
    return parsed.data;
  } catch (err) {
    console.warn("[client-cache] Failed to read cached dashboard data:", err);
    return null;
  }
}

/** Safe localStorage setter for dashboard metadata */
export function setCachedDashboardData(data: DashboardCache): void {
  memoryCache.dash = data;
  if (!isBrowser()) return;

  try {
    const envelope: CacheEnvelope<DashboardCache> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(DASH_CACHE_KEY, JSON.stringify(envelope));
  } catch (err) {
    console.warn("[client-cache] Failed to save dashboard data to cache:", err);
  }
}

/** Clear cached dashboard data */
export function clearCachedDashboardData(): void {
  memoryCache.dash = null;
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(DASH_CACHE_KEY);
  } catch (err) {
    console.warn("[client-cache] Failed to clear dashboard cache:", err);
  }
}

/** In-memory and sessionStorage cache for wedding listings (10-minute session TTL) */
const WEDDINGS_TTL_MS = 10 * 60 * 1000;

export function getCachedWeddings(): Wedding[] | null {
  if (memoryCache.weddings && memoryCache.weddings.length > 0) {
    return memoryCache.weddings;
  }
  if (!isBrowser()) return null;

  try {
    const raw = sessionStorage.getItem(WEDDINGS_SESSION_KEY);
    if (!raw) return null;
    const parsed: CacheEnvelope<Wedding[]> = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.data) || parsed.data.length === 0) return null;

    if (Date.now() - parsed.timestamp > WEDDINGS_TTL_MS) {
      sessionStorage.removeItem(WEDDINGS_SESSION_KEY);
      return null;
    }

    memoryCache.weddings = parsed.data;
    return parsed.data;
  } catch {
    return null;
  }
}

export function setCachedWeddings(weddings: Wedding[]): void {
  if (!Array.isArray(weddings) || weddings.length === 0) return;
  memoryCache.weddings = weddings;
  if (!isBrowser()) return;

  try {
    const envelope: CacheEnvelope<Wedding[]> = {
      data: weddings,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(WEDDINGS_SESSION_KEY, JSON.stringify(envelope));
  } catch {
    // SessionStorage may be disabled or full
  }
}
