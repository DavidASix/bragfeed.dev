import { eq, and, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

import { NextRouteContext, RequestHandler } from "@/middleware/types";
import { withAuth } from "@/middleware/withAuth";
import { withBody } from "@/middleware/withBody";
import { db } from "@/schema/db";
import { business_stats, businesses, reviews } from "@/schema/schema";

import schema from "./schema";

export const POST: RequestHandler<NextRouteContext> = withAuth(
  withBody(schema, async (_, context) => {
    const { user_id, body } = context;
    const businessId = body.businessId;

    // Get business details with stats
    const businessData = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        place_id: businesses.place_id,
        address: businesses.address,
        minimum_score: businesses.minimum_score,
        stats: {
          review_count: business_stats.review_count,
          review_score: business_stats.review_score,
        },
      })
      .from(businesses)
      .leftJoin(business_stats, eq(businesses.id, business_stats.business_id))
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
      business: businessData[0],
      reviews: businessReviews.map((review) => ({
        ...review,
        datetime: review.datetime ? review.datetime.toISOString() : null,
      })),
    });

    return NextResponse.json(response);
  }),
);
