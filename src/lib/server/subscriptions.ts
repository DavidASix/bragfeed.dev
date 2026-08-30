import { and, desc, eq, gte, lte } from "drizzle-orm";

import { db } from "@/schema/db";
import { subscription_payments, users } from "@/schema/schema";

export type ActiveSubscription = {
  id: number;
  subscriptionStart: Date;
  subscriptionEnd: Date;
};

export type SubscriptionDetails = {
  hasActiveSubscription: boolean;
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
};

/**
 * Finds the current subscription period that grants a user paid access.
 *
 * @param userId - Authenticated user whose access is being checked.
 * @returns The active subscription period, or null when no period covers the current time.
 */
export async function getActiveSubscription(
  userId: string,
): Promise<ActiveSubscription | null> {
  const now = new Date();
  const [subscription] = await db
    .select({
      id: subscription_payments.id,
      subscriptionStart: subscription_payments.subscription_start,
      subscriptionEnd: subscription_payments.subscription_end,
    })
    .from(subscription_payments)
    .where(
      and(
        eq(subscription_payments.user_id, userId),
        lte(subscription_payments.subscription_start, now),
        gte(subscription_payments.subscription_end, now),
      ),
    )
    .orderBy(desc(subscription_payments.subscription_end))
    .limit(1);

  return subscription ?? null;
}

/**
 * Returns the billing state displayed to an authenticated user.
 *
 * @param userId - Authenticated user whose billing state is requested.
 * @returns Renewal state together with the current subscription period when one exists.
 */
export async function getSubscriptionDetails(
  userId: string,
): Promise<SubscriptionDetails> {
  const [subscription, [user]] = await Promise.all([
    getActiveSubscription(userId),
    db
      .select({
        hasActiveSubscription: users.has_active_subscription,
      })
      .from(users)
      .where(eq(users.id, userId)),
  ]);

  return {
    hasActiveSubscription: user.hasActiveSubscription,
    subscriptionStart: subscription?.subscriptionStart,
    subscriptionEnd: subscription?.subscriptionEnd,
  };
}
