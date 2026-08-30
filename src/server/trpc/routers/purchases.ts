import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { z } from "zod";

import { productKeys, products } from "@/lib/products";
import { getSubscriptionDetails } from "@/lib/server/subscriptions";
import { stripe } from "@/lib/server/stripe";
import { db } from "@/schema/db";
import { users } from "@/schema/schema";
import { protectedProcedure, router } from "../init";

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

  initializeCheckout: protectedProcedure
    .input(z.object({ product: z.enum(productKeys) }))
    .mutation(async ({ ctx, input }) => {
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

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
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
