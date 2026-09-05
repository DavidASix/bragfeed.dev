import { db } from "@/schema/db";
import { events } from "@/schema/schema";

import { businessId } from "./businesses";
export async function up() {
  console.log("Seeding events table...");

  await db.insert(events).values([
    {
      event: "update_reviews",
      user_id: "00000000-0000-0000-0000-000000000001",
      metadata: { business_id: businessId },
      timestamp: new Date("2025-07-27T04:22:09.499Z"),
    },
    {
      event: "update_stats",
      user_id: "00000000-0000-0000-0000-000000000001",
      metadata: { business_id: businessId },
      timestamp: new Date("2025-07-27T04:22:09.502Z"),
    },
  ]);

  console.log("Events seeded successfully");
}
