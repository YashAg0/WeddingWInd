/**
 * Client-side localStorage utilities for wedding application drafts.
 * Allows unauthenticated users to save progress locally before signing in.
 * Authenticated users use server-side database storage instead.
 */

import { WeddingDurationDays, WeddingTier } from "@/lib/services/pricing-engine";
import { HostDayInput } from "@/lib/actions/host-application";

export interface HostDraftPayload {
  hostName: string;
  email: string;
  phone?: string;
  preferredContactMethod?: "WHATSAPP" | "PHONE" | "EMAIL";
  brideName?: string;
  groomName?: string;
  coupleNames: string;
  city: string;
  state?: string;
  venueName?: string;
  weddingDate: string;
  durationDays: WeddingDurationDays;
  tradition?: string;
  customTradition?: string;
  weddingScale?: "INTIMATE" | "SMALL" | "MEDIUM" | "LARGE" | "GRAND";
  expectedTotalGuests?: number;
  expectedInternationalGuests?: number;
  requestedTier?: WeddingTier;
  story?: string;
  days?: HostDayInput[];
}

const STORAGE_KEY = "weddingwithindia_host_draft";
const AUTO_SUBMIT_INTENT_KEY = "weddingwithindia_auto_submit_intent";

/**
 * Save a wedding application draft to localStorage.
 * Used by unauthenticated users to persist progress.
 */
export function saveLocalWeddingDraft(draft: HostDraftPayload): void {
  if (typeof window === "undefined") return; // SSR guard
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...draft,
      savedAt: new Date().toISOString(),
    }));
  } catch (e) {
    console.warn("Failed to save wedding draft to localStorage:", e);
  }
}

/**
 * Retrieve the most recent wedding application draft from localStorage.
 */
export function getLocalWeddingDraft(): HostDraftPayload | null {
  if (typeof window === "undefined") return null; // SSR guard
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // Remove metadata fields before returning
    const { savedAt, ...draft } = parsed;
    return draft as HostDraftPayload;
  } catch (e) {
    console.warn("Failed to retrieve wedding draft from localStorage:", e);
    return null;
  }
}

/**
 * Clear the saved wedding draft from localStorage.
 * Called after successful submission.
 */
export function clearLocalWeddingDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Failed to clear wedding draft from localStorage:", e);
  }
}

/**
 * Set a flag indicating the user wants to auto-submit after signing in.
 * Useful for unauthenticated users who fill the form and get redirected to login.
 */
export function setAutoSubmitIntent(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTO_SUBMIT_INTENT_KEY, "true");
  } catch (e) {
    console.warn("Failed to set auto-submit intent:", e);
  }
}

/**
 * Check if the user previously intended to auto-submit.
 */
export function hasAutoSubmitIntent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(AUTO_SUBMIT_INTENT_KEY) === "true";
  } catch (e) {
    console.warn("Failed to check auto-submit intent:", e);
    return false;
  }
}

/**
 * Clear the auto-submit intent flag.
 * Called after submission or when user cancels the flow.
 */
export function clearAutoSubmitIntent(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTO_SUBMIT_INTENT_KEY);
  } catch (e) {
    console.warn("Failed to clear auto-submit intent:", e);
  }
}
