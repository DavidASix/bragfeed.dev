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
 * This endpoint refreshes business data by fetching the latest reviews and stats from Google.
 */
export const POST: RequestHandler<NextRouteContext> = withAuth(
  withBody(schema, async (_, context) => {
    try {
      const { businessId } = context.body;

      // Verify the business exists and user has ownership
      const [business] = await db
        .select({ id: businesses.id })
        .from(businesses)
        .where(
          and(
            eq(businesses.id, businessId),
            eq(businesses.user_id, context.user_id),
          ),
        )
        .limit(1);

      if (!business) {
        return NextResponse.json(
          { error: "Business not found" },
          { status: 404 },
        );
      }

      await userHasOwnership(context.user_id, businessId, businesses);

      // Update stats and reviews
      await updateBusinessStats(businessId);
      await updateBusinessReviews(businessId, 100);

      await recordEvent("update_reviews", context.user_id, {
        business_id: businessId,
      });

      await recordEvent("update_stats", context.user_id, {
        business_id: businessId,
      });

      const response = schema.response.parse({
        success: true,
      });

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error("Error refreshing business details:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }),
);
