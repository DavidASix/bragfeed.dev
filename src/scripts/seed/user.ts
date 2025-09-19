import { db } from "@/schema/db";
import { users } from "@/schema/schema";

export async function up() {
  console.log("Seeding user table...");

  await db.insert(users).values({
    id: "6506bac5-e63a-4fa3-b9c9-a94ab5a549fc",
    name: null,
    email: "user@example.com",
    emailVerified: new Date("2025-07-27T08:14:09.624Z"),
    image: null,
    stripe_customer_id: "cus_1234567890example",
    has_active_subscription: true,
  });

  console.log("User seeded successfully");
}
