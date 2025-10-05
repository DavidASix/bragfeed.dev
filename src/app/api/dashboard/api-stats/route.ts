import { eq, sql, and, desc, count, min, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

import { NextRouteContext, RequestHandler } from "@/middleware/types";
import { withAuth } from "@/middleware/withAuth";
import { db } from "@/schema/db";
import { businesses, events } from "@/schema/schema";

import schema from "./schema";

export const GET: RequestHandler<NextRouteContext> = withAuth(
  async (_, context) => {
    const { user_id } = context;

    // Calculate total API calls for the user
    const [totalApiCallsQuery] = await db
      .select({
        total: count(),
      })
      .from(events)
      .where(
        and(eq(events.user_id, user_id), eq(events.event, "api_response")),
      );

    const totalApiCalls = totalApiCallsQuery?.total ?? 0;

    // Calculate monthly API calls (current month)
    const [monthlyApiCallsQuery] = await db
      .select({
        total: count(),
      })
      .from(events)
      .where(
        and(
          eq(events.user_id, user_id),
          eq(events.event, "api_response"),
          gte(events.timestamp, sql`DATE_TRUNC('month', CURRENT_TIMESTAMP)`),
        ),
      );

    const monthlyApiCalls = monthlyApiCallsQuery?.total ?? 0;

    // Calculate daily average API calls
    const [firstApiCallQuery] = await db
      .select({
        firstTimestamp: min(events.timestamp),
      })
      .from(events)
      .where(
        and(eq(events.user_id, user_id), eq(events.event, "api_response")),
      );

    const firstTimestamp = firstApiCallQuery?.firstTimestamp;

    let dailyAverageApiCalls = 0;
    if (firstTimestamp && totalApiCalls > 0) {
      const daysSinceFirst = Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(firstTimestamp).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
      dailyAverageApiCalls = Math.round(totalApiCalls / daysSinceFirst);
    }

    // Get last API call with business name
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
      .where(and(eq(events.user_id, user_id), eq(events.event, "api_response")))
      .orderBy(desc(events.timestamp))
      .limit(1);

    const response = schema.response.parse({
      totalApiCalls,
      monthlyApiCalls,
      dailyAverageApiCalls,
      latestApiCall,
    });

    return NextResponse.json(response);
  },
);
