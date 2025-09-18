import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import schema from "./schema";
import { NextRouteContext, RequestHandler } from "@/middleware/types";
import { withAuth } from "@/middleware/withAuth";
import { withBody } from "@/middleware/withBody";

import {
  updateBusinessReviews,
  updateBusinessStats,
} from "@/lib/server/google/update";
import { recordEvent } from "@/lib/server/events";
import { userHasOwnership } from "@/lib/ownership";
import { businesses } from "@/schema/schema";
import { db } from "@/schema/db";

/**
 * This endpoint inserts a new business into the database using the provided Google Place ID.
 * It then fetches the initial reviews and business stats for that business.
 */
export const POST: RequestHandler<NextRouteContext> = withAuth(
  withBody(schema, async (_, context) => {
    try {
      const { place_id, name, formatted_address } = context.body;

      // Check if business already exists for this user
      const [existingBusiness] = await db
        .select({ id: businesses.id })
        .from(businesses)
        .where(
          and(
            eq(businesses.place_id, place_id),
            eq(businesses.user_id, context.user_id),
          ),
        )
        .limit(1);

      if (existingBusiness) {
        return NextResponse.json(
          { error: "Business already exists for this user" },
          { status: 409 },
        );
      }

      const [business] = await db
        .insert(businesses)
        .values({
          id: crypto.randomUUID(),
          place_id,
          name: name || null,
          address: formatted_address || null,
          user_id: context.user_id,
        })
        .returning({ id: businesses.id });

      await userHasOwnership(context.user_id, business.id, businesses);

      const insertedStats = await updateBusinessStats(business.id);
      const insertedReviews = await updateBusinessReviews(business.id);
      await recordEvent("update_reviews", context.user_id, {
        business_id: business.id,
      });
      await recordEvent("update_stats", context.user_id, {
        business_id: business.id,
      });

      const response = schema.response.parse({
        business_id: business.id,
        reviews: insertedReviews.map((review) => ({
          ...review,
          datetime: review.datetime.toISOString(),
        })),
        stats: insertedStats,
      });

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error("Error processing request:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }),
);
