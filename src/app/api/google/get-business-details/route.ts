import { eq, and, desc, count } from "drizzle-orm";
import { NextResponse } from "next/server";

import { NextRouteContext, RequestHandler } from "@/middleware/types";
import { withAuth } from "@/middleware/withAuth";
import { withBody } from "@/middleware/withBody";
import { db } from "@/schema/db";
import { businesses, reviews } from "@/schema/schema";
import { selectBusinessStats } from "@/lib/server/google/select";

import schema from "./schema";

export const POST: RequestHandler<NextRouteContext> = withAuth(
  withBody(schema, async (_, context) => {
    const { user_id, body } = context;
    const businessId = body.businessId;

    // Get business details
    const businessData = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        place_id: businesses.place_id,
        address: businesses.address,
        minimum_score: businesses.minimum_score,
      })
      .from(businesses)
      .where(
        and(eq(businesses.id, businessId), eq(businesses.user_id, user_id)),
      )
      .limit(1);

    if (businessData.length === 0) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 },
      );
    }

    // Get business stats separately
    const stats = await selectBusinessStats(businessId);

    // Get count of available reviews
    const reviewCount = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.business_id, businessId));

    // Get the most recent review timestamp
    const [latestReview] = await db
      .select({ created_at: reviews.created_at })
      .from(reviews)
      .where(eq(reviews.business_id, businessId))
      .orderBy(desc(reviews.created_at))
      .limit(1);

    // Determine last refreshed date (use latest review as proxy)
    const lastRefreshed = latestReview?.created_at ?? null;

    // Get reviews for this business
    const businessReviews = await db
      .select({
        id: reviews.id,
        author_name: reviews.author_name,
        author_image: reviews.author_image,
        datetime: reviews.datetime,
        link: reviews.link,
        rating: reviews.rating,
        comments: reviews.comments,
      })
      .from(reviews)
      .where(eq(reviews.business_id, businessId))
      .orderBy(desc(reviews.datetime));

    const response = schema.response.parse({
      business: {
        ...businessData[0],
        stats: {
          review_count: stats.review_count,
          review_score: stats.review_score,
        },
      },
      reviews: businessReviews.map((review) => ({
        ...review,
        datetime: review.datetime ? review.datetime.toISOString() : null,
      })),
      available_reviews: reviewCount[0].count,
      last_refreshed: lastRefreshed ? lastRefreshed.toISOString() : null,
    });

    return NextResponse.json(response);
  }),
);
