import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  businesses: { id: "businesses.id" },
  reviews: {
    lookup_id: "reviews.lookup_id",
    business_id: "reviews.business_id",
  },
  businessStats: {
    business_id: "business_stats.business_id",
    review_count: "business_stats.review_count",
    review_score: "business_stats.review_score",
  },
  businessRows: vi.fn(),
  reviewRows: vi.fn(),
  returnedStats: vi.fn(),
  insertedValues: vi.fn(),
  getRecent: vi.fn(),
  getStats: vi.fn(),
  constructor: vi.fn(),
  recordEvent: vi.fn(),
}));

vi.mock("drizzle-orm", () => ({
  and: vi.fn((...conditions: unknown[]) => conditions),
  eq: vi.fn((left: unknown, right: unknown) => [left, right]),
  inArray: vi.fn((left: unknown, right: unknown) => [left, right]),
}));

vi.mock("@/schema/schema", () => ({
  businesses: mocks.businesses,
  reviews: mocks.reviews,
  business_stats: mocks.businessStats,
}));

vi.mock("@/schema/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: (table: unknown) => ({
        where: () =>
          Promise.resolve(
            table === mocks.businesses
              ? mocks.businessRows()
              : mocks.reviewRows(),
          ),
      }),
    })),
    insert: vi.fn((table: unknown) => ({
      values: (values: unknown) => {
        mocks.insertedValues(table, values);
        return {
          returning: () => Promise.resolve(mocks.returnedStats()),
        };
      },
    })),
  },
}));

vi.mock("@/google-reviews", () => ({
  default: class {
    constructor(placeId: string) {
      mocks.constructor(placeId);
    }

    getRecent(limit?: number) {
      return mocks.getRecent(limit);
    }

    getStats() {
      return mocks.getStats();
    }
  },
}));

vi.mock("@/lib/server/events", () => ({
  recordEvent: mocks.recordEvent,
}));

import { db } from "@/schema/db";
import {
  updateBusinessReviews,
  updateBusinessStats,
} from "@/lib/server/google/update";

const review = {
  review_id: "review-1",
  review_text: "Excellent",
  rating: 5,
  review_datetime_utc: "2026-08-15T12:30:00.000Z",
  review_link: "https://example.com/review-1",
  author_name: "Reviewer",
  author_photo_url: null,
};

describe("Google update orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.businessRows.mockReturnValue([
      { id: "business-1", place_id: "place-1", user_id: "user-1" },
    ]);
    mocks.reviewRows.mockReturnValue([]);
    mocks.returnedStats.mockReturnValue([
      { business_id: "business-1", review_count: 42, review_score: 4.7 },
    ]);
    mocks.getStats.mockResolvedValue({ review_count: 42, rating: 4.7 });
    mocks.getRecent.mockResolvedValue([review]);
    mocks.recordEvent.mockResolvedValue(undefined);
  });

  it("persists provider statistics before recording a successful refresh", async () => {
    await expect(updateBusinessStats("business-1")).resolves.toEqual({
      business_id: "business-1",
      review_count: 42,
      review_score: 4.7,
    });

    expect(mocks.constructor).toHaveBeenCalledWith("place-1");
    expect(mocks.insertedValues).toHaveBeenCalledWith(mocks.businessStats, {
      business_id: "business-1",
      review_count: 42,
      review_score: 4.7,
    });
    expect(mocks.recordEvent).toHaveBeenCalledWith("update_stats", "user-1", {
      business_id: "business-1",
    });
  });

  it("maps and persists fetched provider reviews", async () => {
    const result = await updateBusinessReviews("business-1", 25);

    expect(mocks.getRecent).toHaveBeenCalledWith(25);
    expect(mocks.insertedValues).toHaveBeenCalledWith(mocks.reviews, [
      {
        business_id: "business-1",
        lookup_id: "review-1",
        author_name: "Reviewer",
        author_image: null,
        datetime: new Date("2026-08-15T12:30:00.000Z"),
        link: "https://example.com/review-1",
        rating: 5,
        comments: "Excellent",
      },
    ]);
    expect(result).toEqual([
      {
        business_id: "business-1",
        lookup_id: "review-1",
        author_name: "Reviewer",
        author_image: null,
        datetime: new Date("2026-08-15T12:30:00.000Z"),
        link: "https://example.com/review-1",
        rating: 5,
        comments: "Excellent",
      },
    ]);
    expect(mocks.recordEvent).toHaveBeenCalledWith("update_reviews", "user-1", {
      business_id: "business-1",
    });
  });

  it("does not insert a review already stored for this business", async () => {
    mocks.reviewRows.mockReturnValue([{ lookup_id: "review-1" }]);

    await expect(updateBusinessReviews("business-1")).resolves.toEqual([]);

    expect(vi.mocked(db.insert)).not.toHaveBeenCalled();
    expect(mocks.recordEvent).toHaveBeenCalledWith("update_reviews", "user-1", {
      business_id: "business-1",
    });
  });

  it.each([updateBusinessStats, updateBusinessReviews])(
    "rejects an unknown business before contacting the provider",
    async (update) => {
      mocks.businessRows.mockReturnValue([]);

      await expect(update("business-1")).rejects.toThrow("Business not found");
      expect(mocks.constructor).not.toHaveBeenCalled();
      expect(mocks.recordEvent).not.toHaveBeenCalled();
    },
  );

  it.each([updateBusinessStats, updateBusinessReviews])(
    "rejects a business without a place ID before contacting the provider",
    async (update) => {
      mocks.businessRows.mockReturnValue([
        { id: "business-1", place_id: null, user_id: "user-1" },
      ]);

      await expect(update("business-1")).rejects.toThrow("Place ID not found");
      expect(mocks.constructor).not.toHaveBeenCalled();
      expect(mocks.recordEvent).not.toHaveBeenCalled();
    },
  );

  it("does not record a successful review refresh when the provider fails", async () => {
    mocks.getRecent.mockRejectedValue(new Error("provider unavailable"));

    await expect(updateBusinessReviews("business-1")).rejects.toThrow(
      "provider unavailable",
    );
    expect(mocks.recordEvent).not.toHaveBeenCalled();
  });

  it("does not record a successful stats refresh when persistence fails", async () => {
    vi.mocked(db.insert).mockImplementationOnce(() => {
      throw new Error("database unavailable");
    });

    await expect(updateBusinessStats("business-1")).rejects.toThrow(
      "database unavailable",
    );
    expect(mocks.recordEvent).not.toHaveBeenCalled();
  });
});
