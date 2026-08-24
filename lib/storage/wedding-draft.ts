/**
 * lib/storage/wedding-draft.ts
 *
 * Client-Side Persistence Layer for Wedding Listing Drafts.
 * Ensures zero data loss when unauthenticated users fill out the /list-wedding form
 * and are redirected through Clerk sign-in / sign-up flows.
 */

import { WeddingTier, WeddingDurationDays } from "@/lib/services/pricing-engine";
import { HostDayInput } from "@/lib/actions/host-application";

export const DRAFT_STORAGE_KEY = "wwi_host_application_draft_v1";
export const INTENT_STORAGE_KEY = "wwi_host_draft_auto_submit";

export interface HostDraftPayload {
  hostName: string;
  email?: string;
  phone?: string;
  preferredContactMethod: "WHATSAPP" | "PHONE" | "EMAIL";
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
  weddingScale: "INTIMATE" | "SMALL" | "MEDIUM" | "LARGE" | "GRAND";
  expectedTotalGuests: number;
  expectedInternationalGuests: number;
  requestedTier: WeddingTier;
  story?: string;
  days: HostDayInput[];
  savedAt: number;
}

/**
 * Saves a snapshot of the current wedding listing form to client storage.
 */
export function saveLocalWeddingDraft(data: HostDraftPayload): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("[wedding-draft-storage] Unable to save draft to localStorage:", e);
  }
}

/**
 * Retrieves the saved draft snapshot from client storage, if one exists and is valid.
 */
export function getLocalWeddingDraft(): HostDraftPayload | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && (parsed.coupleNames || parsed.city || parsed.hostName)) {
      return parsed as HostDraftPayload;
    }
    return null;
  } catch (e) {
    console.warn("[wedding-draft-storage] Unable to read draft from localStorage:", e);
    return null;
  }
}

/**
 * Clears the local draft and any pending auto-submit flags upon successful submission.
 */
export function clearLocalWeddingDraft(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    localStorage.removeItem(INTENT_STORAGE_KEY);
  } catch (e) {
    console.warn("[wedding-draft-storage] Unable to clear draft from localStorage:", e);
  }
}

/**
 * Sets or clears the intent flag indicating that the form should auto-submit once the user authenticates.
 */
export function setAutoSubmitIntent(enable: boolean): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (enable) {
      localStorage.setItem(INTENT_STORAGE_KEY, "true");
    } else {
      localStorage.removeItem(INTENT_STORAGE_KEY);
    }
  } catch (e) {
    console.warn("[wedding-draft-storage] Unable to set auto-submit intent:", e);
  }
}

/**
 * Checks whether an auto-submit intent was registered before the user was sent to login/signup.
 */
export function hasAutoSubmitIntent(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    return localStorage.getItem(INTENT_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}
