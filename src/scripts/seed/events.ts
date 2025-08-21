import { db } from "@/schema/db";
import { events } from "@/schema/schema";

import { businessId } from "./businesses";
export async function up() {
  console.log("Seeding events table...");

  await db.insert(events).values([
    {
      event: "update_reviews",
      user_id: "6506bac5-e63a-4fa3-b9c9-a94ab5a549fc",
      metadata: { business_id: businessId },
      timestamp: new Date("2025-07-27T04:22:09.499Z"),
    },
    {
      event: "update_stats",
      user_id: "6506bac5-e63a-4fa3-b9c9-a94ab5a549fc",
      metadata: { business_id: businessId },
      timestamp: new Date("2025-07-27T04:22:09.502Z"),
    },
  ]);

  console.log("Events seeded successfully");
}
