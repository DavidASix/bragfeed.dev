import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserIdForApiKey } from "@/lib/server/api-keys";
import { getLastEvent, recordEvent } from "@/lib/server/events";
import {
  selectBusinessReviews,
  selectBusinessStats,
} from "@/lib/server/google/select";
import {
  updateBusinessReviews,
  updateBusinessStats,
} from "@/lib/server/google/update";
import { checkAndRecordRateLimit } from "@/lib/server/rate-limit";
import { getActiveSubscription } from "@/lib/server/subscriptions";
import { userHasOwnership } from "@/lib/ownership";
import { db } from "@/schema/db";
import { businesses } from "@/schema/schema";

export const schema = {
  input: z.object({
    business_id: z.string().uuid(),
  }),
  output: z.object({
    reviews: z.array(
      z.object({
        author_name: z.string().nullable(),
        author_image: z.string().nullable(),
        datetime: z.string().datetime().nullable(),
        link: z.string().nullable(),
        rating: z.number().nullable(),
        comments: z.string().nullable(),
      }),
    ),
    stats: z.object({
      review_count: z.number().nullable(),
      review_score: z.number().nullable(),
    }),
  }),
};

const rateLimits = [
  {
    eventType: "fetch_updated_data_1d",
    maxRequests: 500,
    windowMs: 24 * 60 * 60 * 1000,
  },
  {
    eventType: "fetch_updated_data_5m",
    maxRequests: 25,
    windowMs: 5 * 60 * 1000,
  },
] as const;

/**
 * Reads an API key only from the supported Bearer authorization format.
 *
 * @param request - External API request carrying customer credentials.
 * @returns The key value, or null for a missing or malformed header.
 */
function getBearerKey(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  const [scheme, key, extra] = authorization?.split(" ") ?? [];
  return scheme?.toLowerCase() === "bearer" && key && !extra ? key : null;
}

/**
 * Returns fresh-enough reviews and statistics for a business owned by an authenticated paid API user.
 *
 * @param request - Public REST request with a Bearer API key and JSON body.
 * @returns A conventional JSON response with the endpoint's stable status behavior.
 */
export async function POST(request: Request) {
  try {
    const apiKey = getBearerKey(request);
    const userId = apiKey ? await getUserIdForApiKey(apiKey) : null;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getActiveSubscription(userId);
    if (!subscription) {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 403 },
      );
    }

    const parsedBody = schema.input.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    for (const config of rateLimits) {
      const result = await checkAndRecordRateLimit(userId, config);
      if (!result.allowed) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: `Too many ${config.eventType} requests. Limit: ${config.maxRequests} per ${Math.round(config.windowMs / 1000)} seconds`,
            retryAfter: result.retryAfterSeconds,
          },
          { status: 429 },
        );
      }
    }

    const { business_id: businessId } = parsedBody.data;
    if (!(await userHasOwnership(userId, businessId, businesses))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [lastUpdateReviews, lastUpdateStats] = await Promise.all([
      getLastEvent("update_reviews", userId),
      getLastEvent("update_stats", userId),
    ]);
    if (
      !lastUpdateReviews?.timestamp ||
      lastUpdateReviews.timestamp < oneDayAgo
    ) {
      try {
        await updateBusinessReviews(businessId);
      } catch (error) {
        console.error("Failed to update reviews", error);
      }
    }
    if (!lastUpdateStats?.timestamp || lastUpdateStats.timestamp < oneDayAgo) {
      try {
        await updateBusinessStats(businessId);
      } catch (error) {
        console.error("Failed to update stats", error);
      }
    }

    await recordEvent("api_response", userId, {
      business_id: businessId,
      api_endpoint: "fetch-updated-data",
    });
    const [business] = await db
      .select({ minimum_score: businesses.minimum_score })
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);
    const [reviews, stats] = await Promise.all([
      selectBusinessReviews(businessId, business?.minimum_score ?? 1),
      selectBusinessStats(businessId),
    ]);

    const response = schema.output.parse({
      reviews: reviews.map((review) => ({
        ...review,
        datetime: review.datetime?.toISOString() ?? null,
      })),
      stats,
    });
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
