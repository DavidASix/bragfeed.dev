import { and, count, desc, eq, gte, min, sql } from "drizzle-orm";

import { db } from "@/schema/db";
import { businesses, business_stats, events } from "@/schema/schema";
import { protectedProcedure, router } from "../init";

export const dashboardRouter = router({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [totalResult] = await db
      .select({ total: count() })
      .from(events)
      .where(
        and(eq(events.user_id, ctx.userId), eq(events.event, "api_response")),
      );
    const totalApiCalls = totalResult?.total ?? 0;

    const [monthlyResult] = await db
      .select({ total: count() })
      .from(events)
      .where(
        and(
          eq(events.user_id, ctx.userId),
          eq(events.event, "api_response"),
          gte(events.timestamp, sql`DATE_TRUNC('month', CURRENT_TIMESTAMP)`),
        ),
      );
    const monthlyApiCalls = monthlyResult?.total ?? 0;

    const [firstResult] = await db
      .select({ firstTimestamp: min(events.timestamp) })
      .from(events)
      .where(
        and(eq(events.user_id, ctx.userId), eq(events.event, "api_response")),
      );
    const firstTimestamp = firstResult?.firstTimestamp;
    const daysSinceFirst = firstTimestamp
      ? Math.max(
          1,
          Math.floor(
            (Date.now() - firstTimestamp.getTime()) / (1000 * 60 * 60 * 24),
          ),
        )
      : 1;
    const dailyAverageApiCalls = firstTimestamp
      ? Math.round(totalApiCalls / daysSinceFirst)
      : 0;

    const [latestApiCall] = await db
      .select({
        timestamp: events.timestamp,
        businessName: businesses.name,
      })
      .from(events)
      .leftJoin(
        businesses,
        eq(
          sql`${businesses.id}::text`,
          sql`${events.metadata}->>'business_id'`,
        ),
      )
      .where(
        and(eq(events.user_id, ctx.userId), eq(events.event, "api_response")),
      )
      .orderBy(desc(events.timestamp))
      .limit(1);

    return {
      totalApiCalls,
      monthlyApiCalls,
      dailyAverageApiCalls,
      latestApiCall: latestApiCall ?? null,
    };
  }),

  getBusinesses: protectedProcedure.query(async ({ ctx }) => {
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

    const result = await db
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
      .where(eq(businesses.user_id, ctx.userId))
      .orderBy(desc(sql`COALESCE(${apiCallCounts.count}, 0)`));

    return { businesses: result };
  }),
});
