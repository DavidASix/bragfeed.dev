import { desc, eq } from "drizzle-orm";
import { db } from "@/schema/db";
import { reviews, business_stats } from "@/schema/schema";

/**
 * Fetch the latest business stats for a given business ID
 * @param { business_id: string } - The database UUID of the business to fetch stats for
 * @returns { review_count: number, review_score: number } - The latest stats for the given business
 */
export async function selectBusinessStats(business_id: string): Promise<{
  review_count: number | null;
  review_score: number | null;
}> {
  const latestStats = await db
    .select({
      review_count: business_stats.review_count,
      review_score: business_stats.review_score,
    })
    .from(business_stats)
    .where(eq(business_stats.business_id, business_id))
    .orderBy(desc(business_stats.created_at))
    .limit(1)
    .then((rows) => rows[0]);

  return latestStats;
}

/**
 * Fetch the reviews for a given business
 * @param { business_id: string } - The database UUID of the business to fetch reviews for
 * @returns { reviews: Review[] } - The reviews for the given business
 */
export async function selectBusinessReviews(business_id: string): Promise<
  {
    author_name: string | null;
    author_image: string | null;
    datetime: Date | null;
    link: string | null;
    rating: number | null;
    comments: string | null;
  }[]
> {
  const businessReviews = await db
    .select({
      author_name: reviews.author_name,
      author_image: reviews.author_image,
      datetime: reviews.datetime,
      link: reviews.link,
      rating: reviews.rating,
      comments: reviews.comments,
    })
    .from(reviews)
    .where(eq(reviews.business_id, business_id))
    .orderBy(desc(reviews.datetime))
    .limit(30);

  return businessReviews;
}
