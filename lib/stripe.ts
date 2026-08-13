import Stripe from "stripe";
import { env } from "./env";

/**
 * Stripe client singleton.
 *
 * SECURITY: Uses env.ts for key validation.
 * Missing STRIPE_SECRET_KEY in production will throw at startup, not silently
 * fall back to a mock key that passes $0 charges.
 */
let _stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripeInstance) {
    _stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, {
      // Keep in sync with installed stripe experience version (stripe@22.3.1)
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
      maxNetworkRetries: 2,
      telemetry: false,
    });
  }
  return _stripeInstance;
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const instance = getStripe();
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  }
});

export const PAYMENT_EXPIRY_MINUTES = Number(process.env.PAYMENT_EXPIRY_MINUTES || 30);
