import { db } from "@/schema/db";
import { subscription_payments } from "@/schema/schema";

export async function up() {
  console.log("Seeding subscription_payments table...");

  await db.insert(subscription_payments).values({
    user_id: "6506bac5-e63a-4fa3-b9c9-a94ab5a549fc",
    stripe_customer_id: "cus_1234567890example",
    invoice_id: "in_1234567890example123",
    amount: 899,
    currency: "cad",
    billing_reason: "subscription_create",
    subscription_start: new Date("2025-07-06T18:14:41.000Z"),
    subscription_end: new Date("2029-08-06T18:14:41.000Z"),
    created_at: new Date("2025-07-06T18:14:41.000Z"),
  });

  console.log("Subscription payments seeded successfully");
}
