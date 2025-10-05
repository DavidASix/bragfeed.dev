import { eq, sql, desc, count, and } from "drizzle-orm";
import { NextResponse } from "next/server";

import { NextRouteContext, RequestHandler } from "@/middleware/types";
import { withAuth } from "@/middleware/withAuth";
import { db } from "@/schema/db";
import { businesses, business_stats, events } from "@/schema/schema";

import schema from "./schema";

export const GET: RequestHandler<NextRouteContext> = withAuth(
  async (_, context) => {
    const { user_id } = context;

    // Aggregate API call counts by business_id
    const apiCallCounts = db
      .select({
        businessId: sql<string>`${events.metadata}->>'business_id'`.as(
          "api_call_count_business_id",
        ),
        count: count().as("count"),
      })
      .from(events)
      .where(eq(events.event, "api_response"))
      .groupBy(sql`${events.metadata}->>'business_id'`)
      .as("api_call_counts");

    // Get latest stats for each business (pre-filtered to one row per business)
    const latestStats = db.$with("latest_stats").as(
      db
        .select({
          businessId: business_stats.business_id,
          reviewCount: business_stats.review_count,
          reviewScore: business_stats.review_score,
          rowNum:
            sql<number>`ROW_NUMBER() OVER (PARTITION BY ${business_stats.business_id} ORDER BY ${business_stats.created_at} DESC)`.as(
              "row_num",
            ),
        })
        .from(business_stats),
    );

    // Get all businesses with their stats and API call counts
    const businessesWithStats = await db
      .with(latestStats)
      .select({
        id: businesses.id,
        name: businesses.name,
        address: businesses.address,
        stats: {
          review_count: latestStats.reviewCount,
          review_score: latestStats.reviewScore,
        },
        apiCallCount: sql<number>`COALESCE(${apiCallCounts.count}, 0)::int`.as(
          "api_call_count",
        ),
      })
      .from(businesses)
      .leftJoin(
        latestStats,
        and(
          eq(businesses.id, latestStats.businessId),
          eq(latestStats.rowNum, 1),
        ),
      )
      .leftJoin(
        apiCallCounts,
        eq(sql`${businesses.id}::text`, apiCallCounts.businessId),
      )
      .where(eq(businesses.user_id, user_id))
      .orderBy(desc(sql`COALESCE(${apiCallCounts.count}, 0)`));

    const response = schema.response.parse({
      businesses: businessesWithStats,
    });

    return NextResponse.json(response);
  },
);
