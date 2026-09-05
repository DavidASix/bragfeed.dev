import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { z } from "zod";

import { productKeys, products } from "@/lib/products";
import {
  getPaidAccess,
  getSubscriptionDetails,
} from "@/lib/server/subscriptions";
import { stripe } from "@/lib/server/stripe";
import { db } from "@/schema/db";
import { users } from "@/schema/schema";
import { protectedProcedure, router } from "..";

/**
 * Cancels each active Stripe subscription and reports how many completed.
 *
 * @param subscriptions - Active Stripe subscriptions owned by one customer.
 * @returns Number of subscriptions successfully cancelled.
 */
async function cancelAllSubscriptions(
  subscriptions: Stripe.Subscription[],
): Promise<number> {
  let cancelledCount = 0;
  for (const subscription of subscriptions) {
    await stripe.subscriptions.cancel(subscription.id);
    cancelledCount++;
  }
  return cancelledCount;
}

export const purchasesRouter = router({
  getSubscriptionDetails: protectedProcedure.query(({ ctx }) =>
    getSubscriptionDetails(ctx.userId),
  ),

  /**
   * This endpoint initializes a Stripe Checkout session and returns the session details to the client
   * the client then uses the stripe.js library to redirect the user to the Stripe Checkout page
   * After the user completes the payment, a webhook event is sent to the server and the user is
   * redirected to the success or failure page based on the payment status.
   */
  initializeCheckout: protectedProcedure
    .input(z.object({ product: z.enum(productKeys) }))
    .mutation(async ({ ctx, input }) => {
      const access = await getPaidAccess(ctx.userId);
      if (access.hasBillingOverride) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Subscription management is disabled for this account",
        });
      }

      const product = products[input.product];
      const params: Stripe.Checkout.SessionCreateParams = {
        success_url: `${process.env.DOMAIN}/subscription/?status=success&product=${input.product}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.DOMAIN}/subscription/?status=fail&product=${input.product}&session_id={CHECKOUT_SESSION_ID}`,
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [{ price: product.price_id, quantity: 1 }],
        metadata: { app_user_id: ctx.userId },
      };
      const session = await stripe.checkout.sessions.create(params);
      return { session };
    }),

  /**
   * Cancel user's active subscriptions
   *
   * This endpoint cancels all active subscriptions for the authenticated user
   * on Stripe.
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const access = await getPaidAccess(ctx.userId);
    if (access.hasBillingOverride) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Subscription management is disabled for this account",
      });
    }

    const [user] = await db
      .select({ stripe_customer_id: users.stripe_customer_id })
      .from(users)
      .where(eq(users.id, ctx.userId))
      .limit(1);

    if (!user?.stripe_customer_id) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: "active",
    });
    if (subscriptions.data.length === 0) {
      return {
        success: true,
        message: "No active subscriptions found to cancel",
        cancelledSubscriptions: 0,
      };
    }

    const cancelledSubscriptions = await cancelAllSubscriptions(
      subscriptions.data,
    );
    await db
      .update(users)
      .set({ has_active_subscription: false })
      .where(eq(users.id, ctx.userId));

    return {
      success: true,
      message: `Successfully cancelled ${cancelledSubscriptions} subscription(s)`,
      cancelledSubscriptions,
    };
  }),
});
