import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { eq } from "drizzle-orm";

import { stripe } from "@/lib/server/stripe";
import { db } from "@/schema/db";
import { users, subscription_payments } from "@/schema/schema";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Handles checkout.session.completed events
 *
 * This event is triggered when a user successfully completes a checkout session
 * that was initialized from our /initialize-checkout endpoint. We use this to:
 * 1. Record the customer ID in the user's profile for future reference
 * 2. Link the Stripe customer to our internal user via the app_user_id metadata
 */
const handleCheckoutSessionCompleted: Handler = async ({ type, data }) => {
  if (type !== "checkout.session.completed") {
    throw new Error(`Expected checkout.session.completed, got ${type}`);
  }

  const session = data.object;

  // Extract app_user_id from metadata to identify our internal user
  const appUserId = session.metadata?.app_user_id;

  if (!appUserId) {
    // Orphaned record - we have a successful checkout but can't identify the user
    // TODO: Add notification emails to alert about orphaned checkout sessions
    throw new Error(
      "Checkout session completed without app_user_id metadata, cannot link to user",
    );
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  // Validate that customer is a string (it could be a Customer object or null)
  if (!customerId) {
    throw new Error(
      "Checkout session completed without a valid Stripe customer ID, cannot link to user",
    );
  }

  try {
    // Update the user record with their Stripe customer ID
    await db
      .update(users)
      .set({ stripe_customer_id: customerId, has_active_subscription: true })
      .where(eq(users.id, appUserId));
  } catch (error) {
    throw error;
  }
};

/**
 * Handles invoice.payment_succeeded events
 *
 * This event is triggered after a user has been successfully charged for a subscription.
 * We use this to record details about their payment and the length of their subscription.
 */
const handleInvoicePaymentSucceeded: Handler = async ({ type, data }) => {
  if (type !== "invoice.payment_succeeded") {
    throw new Error(`Expected invoice.payment_succeeded, got ${type}`);
  }

  const invoice = data.object;

  if (!invoice?.customer) {
    // Invoice does not have a customer ID, we cannot look up the associated user
    throw new Error("Invoice is missing customer ID, cannot process payment");
  } else if (!invoice.id) {
    throw new Error(
      "Invoice is missing ID and is thus a future invoice, payment not processed",
    );
  }

  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer.id;

  try {
    // Find the user by their Stripe customer ID
    // We retry a few times incase the checkout.session.completed event hasn't been fully processed yet.
    // While payment_succeeded always fires after checkout.session.completed, the handler for the latter
    // may not have completed updating the user record by the time we get here.
    let checkCount = 0;
    let userId: string | undefined;
    while (checkCount < 20 && !userId) {
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.stripe_customer_id, customerId))
        .limit(1);
      userId = user?.id;
      checkCount++;
      if (!userId) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    if (!userId) {
      throw new Error(`No user found with Stripe customer ID: ${customerId}`);
    }

    // Extract subscription period from the first line item
    const [lineItem] = invoice.lines.data;
    if (!lineItem?.period) {
      throw new Error(
        "Invoice line item is missing subscription period information",
      );
    }

    // Insert payment record into subscription_payments table
    const insertData = {
      user_id: userId,
      stripe_customer_id: customerId,
      invoice_id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      billing_reason: invoice.billing_reason,
      subscription_start: new Date(lineItem.period.start * 1000),
      subscription_end: new Date(lineItem.period.end * 1000),
      created_at: new Date(invoice.created * 1000),
    };

    await db.insert(subscription_payments).values(insertData);

    // Update user's has_active_subscription flag
    await db
      .update(users)
      .set({ has_active_subscription: true })
      .where(eq(users.id, userId));
  } catch (error) {
    throw error;
  }
};

/**
 * Type definition for webhook event handlers using discriminated union
 */
type Handler = (props: Stripe.Event) => Promise<void>;

/**
 * Registry of webhook event handlers
 * Add new handlers here to extend webhook functionality
 */
const webhookHandlers: Record<string, (props: Stripe.Event) => Promise<void>> =
  {
    "checkout.session.completed": handleCheckoutSessionCompleted,
    "invoice.payment_succeeded": handleInvoicePaymentSucceeded,
  };

/**
 * Main webhook endpoint handler
 *
 * Validates Stripe webhook signatures and routes events to appropriate handlers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("Missing Stripe signature");
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 },
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 },
      );
    }

    const handler = webhookHandlers[event.type];
    if (!handler) {
      console.warn("No handler registered for event type:", event.type);
      return NextResponse.json({ received: true });
    }

    console.log(`Handling event: ${event.type}`);

    try {
      await handler(event);
    } catch (error) {
      console.error(`Error handling event ${event.type}:`, error);
      // console.log({event})
      return NextResponse.json(
        { error: `Failed to handle event ${event.type}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
