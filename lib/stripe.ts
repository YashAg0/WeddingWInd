import Stripe from "stripe";
import { env } from "./env";

/**
 * Stripe client singleton.
 *
 * SECURITY: Uses env.ts for key validation.
 * Missing STRIPE_SECRET_KEY in production will throw at startup, not silently
 * fall back to a mock key that passes $0 charges.
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  // Keep in sync with installed stripe package version (stripe@22.3.1)
  apiVersion: "2026-06-24.dahlia",
  typescript: true,
  maxNetworkRetries: 2,
  telemetry: false,
});

export const PAYMENT_EXPIRY_MINUTES = Number(process.env.PAYMENT_EXPIRY_MINUTES || 30);
