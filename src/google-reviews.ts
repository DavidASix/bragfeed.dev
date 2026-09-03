import axios from "axios";
import { z } from "zod";

/**
 * GoogleReviews class for fetching and parsing Google reviews and business details.
 *
 * @param { string } businessId - The Google business ID to fetch reviews for.
 */
export default class GoogleReviews {
  public businessId: string;
  private base = "https://local-business-data.p.rapidapi.com";
  private defaultQueries: string;

  private requestOptions = {
    headers: {
      "x-rapidapi-key": process.env.RAPID_KEY ?? "",
      "x-rapidapi-host": "local-business-data.p.rapidapi.com",
    },
  };

  constructor(businessId: string) {
    this.businessId = businessId;
    this.defaultQueries = new URLSearchParams({
      business_id: this.businessId,
      region: "us",
      language: "en",
    }).toString();
  }

  public async getRecent(inputLimit = 10) {
    const limit = Math.min(inputLimit, 30);
    const url = `${this.base}/business-reviews?${this.defaultQueries}&limit=${limit}&sort_by=newest`;
    try {
      const response = await axios.get(url, this.requestOptions);
      const reviews = z.array(ReviewSchema).parse(response.data.data);
      return reviews;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    }
  }

  public async getStats() {
    const url = `${this.base}/business-details?${this.defaultQueries}`;
    try {
      const response = await axios.get(url, this.requestOptions);
      const stats = BusinessSchema.parse(response.data.data[0]);
      return stats;
    } catch (error) {
      console.error("Error fetching reviews stats:", error);
      throw error;
    }
  }
}

const ReviewSchema = z.object({
  review_id: z.string(),
  review_text: z.string().nullable(),
  rating: z.number().nullable(),
  review_datetime_utc: z.string(),
  review_timestamp: z.number(),
  review_link: z.string(),
  review_photos: z.array(z.string()).nullable(),
  review_language: z.string().nullable(),
  like_count: z.number().nullable(),
  author_id: z.string().nullable(),
  author_link: z.string().nullable(),
  author_name: z.string().nullable(),
  author_photo_url: z.string().nullable(),
  author_review_count: z.number().nullable(),
  owner_response_datetime_utc: z.string().nullable(),
  owner_response_timestamp: z.number().nullable(),
  owner_response_text: z.string().nullable(),
  owner_response_language: z.string().nullable(),
  author_reviews_link: z.string().nullable(),
  author_local_guide_level: z.number().nullable(),
  service_quality: z.string().nullish(),
  hotel_rating_breakdown: z
    .object({
      Food: z.number(),
      Service: z.number(),
      Atmosphere: z.number(),
    })
    .nullish(),
  //review_form: z.string().nullable(), // This is a nullable object of some kind
  review_source: z.string().nullable(),
});

const BusinessSchema = z.object({
  business_id: z.string(),
  google_id: z.string(),
  place_id: z.string(),
  google_mid: z.string().nullable(),
  phone_number: z.string().nullable(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  full_address: z.string(),
  review_count: z.number(),
  rating: z.number().nullable(),
  timezone: z.string().nullable(),
  opening_status: z.string().nullable(),
  working_hours: z.record(z.string(), z.array(z.string())).nullable(),
  website: z.string().nullable(),
  verified: z.boolean().nullable(),
  place_link: z.string(),
  cid: z.string().nullable(),
  reviews_link: z.string().nullable(),
  owner_id: z.string().nullable(),
  owner_link: z.string().nullable(),
  owner_name: z.string().nullable(),
  booking_link: z.string().nullable(),
  reservations_link: z.string().nullable().nullable(),
  business_status: z.string().nullable(),
  type: z.string().nullable(),
  subtypes: z.array(z.string()).nullable(),
  photos_sample: z
    .array(
      z.object({
        photo_id: z.string().nullable(),
        photo_url: z.string().nullable(),
        photo_url_large: z.string().nullable(),
        video_thumbnail_url: z.string().nullable(),
        latitude: z.number().nullable(),
        longitude: z.number().nullable(),
        type: z.string().nullable(),
        photo_datetime_utc: z.string().nullable(),
        photo_timestamp: z.number().nullable(),
      }),
    )
    .nullable(),
  global_plus_code: z.string(),
  compound_plus_code: z.string(),
  reviews_per_rating: z.record(z.string(), z.number()).nullish(),
  photo_count: z.number(),
  about: z
    .object({
      summary: z.string().nullable(),
      details: z.record(z.string(), z.any()),
    })
    .nullable(),
  address: z.string().nullable(),
  menu_link: z.string().nullable(),
  order_link: z.string().nullable(),
  price_level: z.string().nullable(),
  district: z.string().nullable(),
  street_address: z.string().nullable(),
  city: z.string().nullable(),
  zipcode: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),
  posts_sample: z.any().nullable(),
  posts_link: z.string().nullable(),
  reviews_sample: z.array(ReviewSchema.partial()).nullish(),
  located_in: z
    .object({
      google_id: z.string(),
      name: z.string(),
    })
    .optional(),
  emails_and_contacts: z.object({
    emails: z.array(z.string()).nullable(),
    phone_numbers: z.array(z.string()).nullable(),
    facebook: z.string().nullable(),
    instagram: z.string().nullable(),
    yelp: z.string().nullable(),
    tiktok: z.string().nullable(),
    snapchat: z.string().nullable(),
    twitter: z.string().nullable(),
    linkedin: z.string().nullable(),
    github: z.string().nullable(),
    youtube: z.string().nullable(),
    pinterest: z.string().nullable(),
  }),
});
