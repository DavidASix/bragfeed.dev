import { and, count, eq, gte } from "drizzle-orm";

import { db } from "@/schema/db";
import { rate_limit_events } from "@/schema/schema";

export type RateLimitConfig = {
  eventType: string;
  maxRequests: number;
  windowMs: number;
};

export type RateLimitResult =
  { allowed: true } | { allowed: false; retryAfterSeconds: number };

/**
 * Checks and records a rate-limit event, failing open when persistence is unavailable.
 *
 * The count and insert are intentionally separate, preserving the existing small concurrency window. A transactional design can address that separately.
 *
 * @param userId - User whose request is being limited.
 * @param config - Event name, threshold, and rolling time window.
 * @returns Whether the request is allowed and, when denied, the retry interval.
 */
export async function checkAndRecordRateLimit(
  userId: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - config.windowMs);

  try {
    const [eventCount] = await db
      .select({ value: count() })
      .from(rate_limit_events)
      .where(
        and(
          eq(rate_limit_events.user_id, userId),
          eq(rate_limit_events.event_type, config.eventType),
          gte(rate_limit_events.timestamp, windowStart),
        ),
      );

    if ((eventCount?.value ?? 0) >= config.maxRequests) {
      return {
        allowed: false,
        retryAfterSeconds: Math.round(config.windowMs / 1000),
      };
    }

    await db.insert(rate_limit_events).values({
      user_id: userId,
      event_type: config.eventType,
    });
    return { allowed: true };
  } catch (error) {
    console.error("Rate limiting error:", error);
    return { allowed: true };
  }
}
