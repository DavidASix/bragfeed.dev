import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import GoogleReviews from "@/google-reviews";

vi.mock("axios");

const review = {
  review_id: "review-1",
  review_text: "Excellent",
  rating: 5,
  review_datetime_utc: "2026-08-15T12:30:00.000Z",
  review_timestamp: 1_755_260_600,
  review_link: "https://example.com/review-1",
  review_photos: null,
  review_language: "en",
  like_count: 2,
  author_id: "author-1",
  author_link: "https://example.com/author-1",
  author_name: "Reviewer",
  author_photo_url: null,
  author_review_count: 3,
  owner_response_datetime_utc: null,
  owner_response_timestamp: null,
  owner_response_text: null,
  owner_response_language: null,
  author_reviews_link: null,
  author_local_guide_level: null,
  review_source: "google",
};

const business = {
  business_id: "business-1",
  google_id: "google-1",
  place_id: "place-1",
  google_mid: null,
  phone_number: null,
  name: "Business",
  latitude: 43.46,
  longitude: -80.52,
  full_address: "1 Main Street",
  review_count: 42,
  rating: 4.7,
  timezone: "America/Toronto",
  opening_status: "OPEN",
  working_hours: null,
  website: null,
  verified: true,
  place_link: "https://example.com/business",
  cid: null,
  reviews_link: null,
  owner_id: null,
  owner_link: null,
  owner_name: null,
  booking_link: null,
  reservations_link: null,
  business_status: "OPERATIONAL",
  type: null,
  subtypes: null,
  photos_sample: null,
  global_plus_code: "plus-code",
  compound_plus_code: "compound-code",
  photo_count: 0,
  about: null,
  address: null,
  menu_link: null,
  order_link: null,
  price_level: null,
  district: null,
  street_address: null,
  city: null,
  zipcode: null,
  state: null,
  country: null,
  posts_sample: null,
  posts_link: null,
  reviews_sample: null,
  emails_and_contacts: {
    emails: null,
    phone_numbers: null,
    facebook: null,
    instagram: null,
    yelp: null,
    tiktok: null,
    snapchat: null,
    twitter: null,
    linkedin: null,
    github: null,
    youtube: null,
    pinterest: null,
  },
};

describe("GoogleReviews provider boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("RAPID_KEY", "rapid-key");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("requests the newest reviews with an encoded business ID and provider credentials", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { data: [review] } });

    const result = await new GoogleReviews("place/id & one").getRecent();

    expect(axios.get).toHaveBeenCalledWith(
      "https://local-business-data.p.rapidapi.com/business-reviews?business_id=place%2Fid+%26+one&region=us&language=en&limit=10&sort_by=newest",
      {
        headers: {
          "x-rapidapi-key": "rapid-key",
          "x-rapidapi-host": "local-business-data.p.rapidapi.com",
        },
      },
    );
    expect(result).toEqual([review]);
  });

  it("caps provider requests at the supported 30-review maximum", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } });

    await new GoogleReviews("place-1").getRecent(100);

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("limit=30"),
      expect.anything(),
    );
  });

  it("rejects reviews that do not match the provider contract", async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        data: [{ ...review, rating: "5" }],
      },
    });

    await expect(
      new GoogleReviews("place-1").getRecent(),
    ).rejects.toBeInstanceOf(z.ZodError);
  });

  it("parses a representative business-details response", async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { data: [business] },
    });

    await expect(
      new GoogleReviews("place-1").getStats(),
    ).resolves.toMatchObject({
      review_count: 42,
      rating: 4.7,
    });
  });

  it("rejects missing or malformed provider statistics", async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { data: [{ ...business, review_count: "42" }] },
    });

    await expect(
      new GoogleReviews("place-1").getStats(),
    ).rejects.toBeInstanceOf(z.ZodError);
  });
});
