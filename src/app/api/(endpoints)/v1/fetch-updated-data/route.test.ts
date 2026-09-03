import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserIdForApiKey: vi.fn(),
  getActiveSubscription: vi.fn(),
  checkAndRecordRateLimit: vi.fn(),
  userHasOwnership: vi.fn(),
  getLastEvent: vi.fn(),
  recordEvent: vi.fn(),
  selectBusinessReviews: vi.fn(),
  selectBusinessStats: vi.fn(),
  updateBusinessReviews: vi.fn(),
  updateBusinessStats: vi.fn(),
}));

vi.mock("@/lib/server/api-keys", () => ({
  getUserIdForApiKey: mocks.getUserIdForApiKey,
}));
vi.mock("@/lib/server/subscriptions", () => ({
  getActiveSubscription: mocks.getActiveSubscription,
}));
vi.mock("@/lib/server/rate-limit", () => ({
  checkAndRecordRateLimit: mocks.checkAndRecordRateLimit,
}));
vi.mock("@/lib/ownership", () => ({
  userHasOwnership: mocks.userHasOwnership,
}));
vi.mock("@/lib/server/events", () => ({
  getLastEvent: mocks.getLastEvent,
  recordEvent: mocks.recordEvent,
}));
vi.mock("@/lib/server/google/select", () => ({
  selectBusinessReviews: mocks.selectBusinessReviews,
  selectBusinessStats: mocks.selectBusinessStats,
}));
vi.mock("@/lib/server/google/update", () => ({
  updateBusinessReviews: mocks.updateBusinessReviews,
  updateBusinessStats: mocks.updateBusinessStats,
}));
vi.mock("@/schema/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([{ minimum_score: 4 }]),
        }),
      }),
    }),
  },
}));

import { POST } from "@/app/api/(endpoints)/v1/fetch-updated-data/route";

const businessId = "8b46c18a-2f5d-4d8d-9bd4-a0afb52d4d29";

/**
 * Creates an external API request with optional authorization and arbitrary JSON text.
 *
 * @param body - Raw request body used to cover valid and malformed JSON.
 * @param authorization - Optional authorization header value.
 * @returns A request targeting the stable public API URL.
 */
function createRequest(body: string, authorization?: string): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (authorization) headers.set("authorization", authorization);
  return new Request("http://localhost/api/v1/fetch-updated-data", {
    method: "POST",
    headers,
    body,
  });
}

describe("paid fetch-updated-data REST boundary", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-02T12:00:00.000Z"));
    vi.clearAllMocks();
    mocks.getUserIdForApiKey.mockResolvedValue("user-1");
    mocks.getActiveSubscription.mockResolvedValue({ id: 1 });
    mocks.checkAndRecordRateLimit.mockResolvedValue({ allowed: true });
    mocks.userHasOwnership.mockResolvedValue(true);
    mocks.getLastEvent.mockResolvedValue({ timestamp: new Date() });
    mocks.selectBusinessReviews.mockResolvedValue([
      {
        author_name: "Reviewer",
        author_image: null,
        datetime: new Date("2026-01-02T03:04:05.000Z"),
        link: null,
        rating: 5,
        comments: "Great",
      },
    ]);
    mocks.selectBusinessStats.mockResolvedValue({
      review_count: 1,
      review_score: 5,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 401 when authorization is missing", async () => {
    const response = await POST(createRequest(JSON.stringify({ businessId })));
    expect(response.status).toBe(401);
    expect(mocks.getUserIdForApiKey).not.toHaveBeenCalled();
  });

  it("accepts the case-insensitive Bearer authorization scheme", async () => {
    const response = await POST(
      createRequest(
        JSON.stringify({ business_id: businessId }),
        "bearer customer-key",
      ),
    );
    expect(response.status).toBe(200);
    expect(mocks.getUserIdForApiKey).toHaveBeenCalledWith("customer-key");
  });

  it("returns 401 for an invalid API key", async () => {
    mocks.getUserIdForApiKey.mockResolvedValue(null);
    const response = await POST(
      createRequest("{}", "Bearer invalid-customer-key"),
    );
    expect(response.status).toBe(401);
  });

  it("returns 403 before parsing the body for inactive users", async () => {
    mocks.getActiveSubscription.mockResolvedValue(null);
    const response = await POST(createRequest("{", "Bearer customer-key"));
    expect(response.status).toBe(403);
    expect(mocks.checkAndRecordRateLimit).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON without consuming quota", async () => {
    const response = await POST(createRequest("{", "Bearer customer-key"));
    expect(response.status).toBe(400);
    expect(mocks.checkAndRecordRateLimit).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid input without consuming quota", async () => {
    const response = await POST(
      createRequest(JSON.stringify({ business_id: "invalid" }), "Bearer key"),
    );
    expect(response.status).toBe(400);
    expect(mocks.checkAndRecordRateLimit).not.toHaveBeenCalled();
  });

  it("returns 429 with retry information when limited", async () => {
    mocks.checkAndRecordRateLimit.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 86400,
    });
    const response = await POST(
      createRequest(JSON.stringify({ business_id: businessId }), "Bearer key"),
    );
    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      retryAfter: 86400,
    });
  });

  it("returns 403 without reading or refreshing a business owned by another user", async () => {
    mocks.userHasOwnership.mockResolvedValue(false);

    const response = await POST(
      createRequest(JSON.stringify({ business_id: businessId }), "Bearer key"),
    );

    expect(response.status).toBe(403);
    expect(mocks.getLastEvent).not.toHaveBeenCalled();
    expect(mocks.updateBusinessReviews).not.toHaveBeenCalled();
    expect(mocks.updateBusinessStats).not.toHaveBeenCalled();
    expect(mocks.selectBusinessReviews).not.toHaveBeenCalled();
  });

  it("skips provider refreshes when both update events are fresh", async () => {
    const response = await POST(
      createRequest(JSON.stringify({ business_id: businessId }), "Bearer key"),
    );

    expect(response.status).toBe(200);
    expect(mocks.updateBusinessReviews).not.toHaveBeenCalled();
    expect(mocks.updateBusinessStats).not.toHaveBeenCalled();
  });

  it("refreshes both datasets when this business has no update events", async () => {
    mocks.getLastEvent.mockResolvedValue(undefined);

    const response = await POST(
      createRequest(JSON.stringify({ business_id: businessId }), "Bearer key"),
    );

    expect(response.status).toBe(200);
    expect(mocks.updateBusinessReviews).toHaveBeenCalledWith(businessId);
    expect(mocks.updateBusinessStats).toHaveBeenCalledWith(businessId);
  });

  it("refreshes only the stale dataset", async () => {
    mocks.getLastEvent.mockImplementation((event) =>
      Promise.resolve({
        timestamp:
          event === "update_reviews"
            ? new Date("2026-08-31T12:00:00.000Z")
            : new Date("2026-09-02T06:00:00.000Z"),
      }),
    );

    const response = await POST(
      createRequest(JSON.stringify({ business_id: businessId }), "Bearer key"),
    );

    expect(response.status).toBe(200);
    expect(mocks.updateBusinessReviews).toHaveBeenCalledWith(businessId);
    expect(mocks.updateBusinessStats).not.toHaveBeenCalled();
  });

  it("returns cached data when the provider refresh fails", async () => {
    mocks.getLastEvent.mockResolvedValue(undefined);
    mocks.updateBusinessReviews.mockRejectedValue(new Error("reviews failed"));
    mocks.updateBusinessStats.mockRejectedValue(new Error("stats failed"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(
      createRequest(JSON.stringify({ business_id: businessId }), "Bearer key"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      reviews: [{ comments: "Great" }],
      stats: { review_count: 1, review_score: 5 },
    });
  });

  it("uses the resolved user and returns ordinary ISO-date JSON", async () => {
    const response = await POST(
      createRequest(JSON.stringify({ business_id: businessId }), "Bearer key"),
    );
    expect(response.status).toBe(200);
    expect(mocks.userHasOwnership).toHaveBeenCalledWith(
      "user-1",
      businessId,
      expect.anything(),
    );
    expect(mocks.recordEvent).toHaveBeenCalledWith(
      "api_response",
      "user-1",
      expect.anything(),
    );
    await expect(response.json()).resolves.toMatchObject({
      reviews: [{ datetime: "2026-01-02T03:04:05.000Z" }],
    });
  });
});
