import { NextResponse } from "next/server";
import { RequestHandler } from "./types";
import { db } from "@/schema/db";
import { rate_limit_events } from "@/schema/schema";
import { and, eq, gte, count } from "drizzle-orm";

export interface RateLimitConfig {
  eventType: string;
  maxRequests: number;
  windowMs: number;
}

/**
 * Middleware wrapper to implement rate limiting based on event types and time windows.
 * Tracks events in the database and rejects requests that exceed configured limits.
 *
 * @param config - Rate limiting configuration
 * @param config.eventType - The type of event to track (e.g., "fetch_reviews", "update_reviews")
 * @param config.maxRequests - Maximum number of requests allowed in the time window
 * @param config.windowMs - Time window in milliseconds for the rate limit
 *
 * @example
 * ```typescript
 * export const POST = withAuth(
 *   withEventRateLimit(
 *     { eventType: "fetch_reviews", maxRequests: 100, windowMs: 24 * 60 * 60 * 1000 }, // 24 hours
 *     withEventRateLimit(
 *       { eventType: "update_reviews", maxRequests: 10, windowMs: 15 * 60 * 1000 }, // 15 minutes
 *       async (_, context) => {
 *         // Implementation...
 *       }
 *     )
 *   )
 * );
 * ```
 */
export function withEventRateLimit<T extends object & { user_id: string }>(
  config: RateLimitConfig,
  handler: RequestHandler<T>,
): RequestHandler<T> {
  return async function (req, context: T) {
    const { user_id } = context;
    const { eventType, maxRequests, windowMs } = config;

    // Calculate the time window start
    const windowStart = new Date();
    windowStart.setTime(windowStart.getTime() - windowMs);

    try {
      // Count existing events in the time window
      const eventCount = await db
        .select({ value: count() })
        .from(rate_limit_events)
        .where(
          and(
            eq(rate_limit_events.user_id, user_id),
            eq(rate_limit_events.event_type, eventType),
            gte(rate_limit_events.timestamp, windowStart),
          ),
        );

      // Check if rate limit is exceeded
      if (eventCount[0].value >= maxRequests) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: `Too many ${eventType} requests. Limit: ${maxRequests} per ${Math.round(windowMs / 1000)} seconds`,
            retryAfter: Math.round(windowMs / 1000), // seconds
          },
          { status: 429 },
        );
      }

      // Record this event
      await db.insert(rate_limit_events).values({
        user_id,
        event_type: eventType,
      });

      // Continue to the next handler
      return handler(req, context);
    } catch (error) {
      console.error("Rate limiting error:", error);
      // In case of database error, allow the request to proceed
      // to avoid blocking legitimate requests due to infrastructure issues
      return handler(req, context);
    }
  };
}
