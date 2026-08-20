/**
 * lib/attribution.ts
 *
 * Attribution module entry point for Server Components and Server Actions.
 * For Client Components: import types from "@/lib/attribution/types" or "@/lib/attribution/client".
 */

import "server-only";

export type { AttributionData } from "./attribution/types";
export {
  getAttributionCookie,
  setAttributionCookie,
  clearAttributionCookie,
} from "./attribution/server";
