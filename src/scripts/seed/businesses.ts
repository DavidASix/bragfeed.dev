import { db } from "@/schema/db";
import { businesses } from "@/schema/schema";

export const businessId = "00000000-0000-4000-8000-000000000001";

export async function up() {
  console.log("Seeding businesses table...");

  await db.insert(businesses).values({
    id: businessId,
    user_id: "00000000-0000-0000-0000-000000000001",
    name: "UniClaw",
    place_id: "ChIJZVJixfH1K4gRm44apfuxMRg",
    address: "140 University Ave W Unit 1B, Waterloo, ON N2L 6J3, Canada",
  });

  console.log("Businesses seeded successfully");
}
