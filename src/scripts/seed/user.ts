import { db } from "@/schema/db";
import { users } from "@/schema/schema";

export async function up() {
  console.log("Seeding user table...");

  await db
    .insert(users)
    .values([
      {
        id: "00000000-0000-0000-0000-000000000001",
        name: null,
        email: "user@example.com",
        emailVerified: new Date("2025-07-27T08:14:09.624Z"),
        image: null,
        stripe_customer_id: "cus_1234567890example",
        has_active_subscription: true,
        has_billing_override: false,
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        name: "Unsubscribed User",
        email: "unsubscribed@example.com",
        emailVerified: new Date("2025-07-27T08:14:09.624Z"),
        image: null,
        stripe_customer_id: null,
        has_active_subscription: false,
        has_billing_override: false,
      },
    ])
    .onConflictDoNothing();

  console.log("User seeded successfully");
}
