import "server-only";

import Stripe from "stripe";

/**
 * A fake key is provided for fallback as during the build process the env variable
 * is not available, but stripe throws a build-breaking error if it cannot initialize
 */
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_fake";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-08-27.basil",
});
