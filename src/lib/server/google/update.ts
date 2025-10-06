import { reviews, businesses, business_stats } from "@/schema/schema";
import { db } from "@/schema/db";
import { and, eq, inArray } from "drizzle-orm";
import GoogleReviews from "@/google-reviews";

/**
 * Add the current business stats to the database for the given business ID, then return the inserted stats.
 *
 * @param { business_id } - The database business UUID to update.
 * @returns { business_id: string, review_count: number, review_score: number } - The inserted stats.
 */
export async function updateBusinessStats(business_id: string): Promise<{
  business_id: string;
  review_count: number | null;
  review_score: number | null;
}> {
  const business = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, business_id))
    .then((rows) => rows[0]);

  if (!business) throw new Error("Business not found");

  const placeId = business.place_id;
  if (!placeId) throw new Error("Place ID not found");

  // Get the google business class
  const googleReviews = new GoogleReviews(placeId);
  const newStats = await googleReviews.getStats();

  // Store the updated stats
  const insertedStats = await db
    .insert(business_stats)
    .values({
      business_id: business_id,
      review_count: newStats.review_count,
      review_score: newStats.rating,
    })
    .returning({
      business_id: business_stats.business_id,
      review_count: business_stats.review_count,
      review_score: business_stats.review_score,
    })
    .then((rows) => rows[0]);

  return insertedStats;
}

/**
 * Fetch the latest reviews for a business from Google and insert them into the database.
 * This function will only insert new reviews that do not already exist in the database.
 *
 * @param { business_id } - The database business UUID to update.
 * @param { reviewsToFetch } - The number of recent reviews to fetch from Google (default is 10).
 * @returns { Array } - An array of inserted reviews.
 */
export async function updateBusinessReviews(
  business_id: string,
  reviewsToFetch = 10,
) {
  const business = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, business_id))
    .then((rows) => rows[0]);

  if (!business) throw new Error("Business not found");

  const placeId = business.place_id;
  if (!placeId) throw new Error("Place ID not found");

  // Get the google business class
  const googleReviews = new GoogleReviews(placeId);
  const recentReviews = await googleReviews.getRecent(reviewsToFetch);

  // Get the existing reviews for the business which appear in the recentReviews array
  const existingReviews = await db
    .select()
    .from(reviews)
    .where(
      and(
        inArray(
          reviews.lookup_id,
          recentReviews.map((r) => r.review_id),
        ),
        eq(reviews.business_id, business_id),
      ),
    );

  // Format table and remove any existing reviews from the insertable rows1
  const insertableReviews = recentReviews
    .map((review) => ({
      business_id: business_id,
      lookup_id: review.review_id,
      author_name: review.author_name,
      author_image: review.author_photo_url,
      datetime: new Date(review.review_datetime_utc),
      link: review.review_link,
      rating: review.rating,
      comments: review.review_text,
    }))
    .filter(
      (review) =>
        !existingReviews.some((r) => r.lookup_id === review.lookup_id),
    );

  console.log(`Inserting ${insertableReviews.length} new reviews`);
  if (insertableReviews.length > 0) {
    await db.insert(reviews).values(insertableReviews);
  }
  return insertableReviews;
}
