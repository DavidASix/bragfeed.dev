import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

type PolicyMocks = {
  selectRows: unknown[];
  userRows: unknown[];
  selectError: Error | null;
  insertError: Error | null;
  insertValues: Mock<(value: unknown) => void>;
  encryptDeterministic: Mock<(value: string) => Promise<string>>;
};

const mocks = vi.hoisted<PolicyMocks>(() => ({
  selectRows: [],
  userRows: [],
  selectError: null,
  insertError: null,
  insertValues: vi.fn(),
  encryptDeterministic: vi.fn(),
}));

vi.mock("@/schema/db", () => ({
  db: {
    select: (selection?: Record<string, unknown>) => ({
      from: () => {
        const rows =
          selection && Object.hasOwn(selection, "hasBillingOverride")
            ? mocks.userRows
            : mocks.selectRows;
        const query = {
          where: () => query,
          orderBy: () => query,
          limit: () =>
            mocks.selectError
              ? Promise.reject(mocks.selectError)
              : Promise.resolve(rows),
          then: (
            resolve: (value: unknown[]) => unknown,
            reject: (error: Error) => unknown,
          ) => (mocks.selectError ? reject(mocks.selectError) : resolve(rows)),
        };
        return query;
      },
    }),
    insert: () => ({
      values: (value: unknown) => {
        mocks.insertValues(value);
        return mocks.insertError
          ? Promise.reject(mocks.insertError)
          : Promise.resolve();
      },
    }),
  },
}));
vi.mock("@/lib/encryption", () => ({
  encryptDeterministic: mocks.encryptDeterministic,
}));

import { getUserIdForApiKey } from "@/lib/server/api-keys";
import { checkAndRecordRateLimit } from "@/lib/server/rate-limit";
import {
  getActiveSubscription,
  getPaidAccess,
  getSubscriptionDetails,
} from "@/lib/server/subscriptions";

describe("transport-neutral server policy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.selectRows = [];
    mocks.userRows = [];
    mocks.selectError = null;
    mocks.insertError = null;
    mocks.encryptDeterministic.mockResolvedValue("encrypted-key");
  });

  it("returns the active subscription selected for the current period", async () => {
    const subscription = {
      id: 10,
      subscriptionStart: new Date("2026-01-01T00:00:00.000Z"),
      subscriptionEnd: new Date("2027-01-01T00:00:00.000Z"),
    };
    mocks.selectRows = [subscription];
    await expect(getActiveSubscription("user-1")).resolves.toEqual(
      subscription,
    );
  });

  it("returns null when no subscription covers the current period", async () => {
    await expect(getActiveSubscription("user-1")).resolves.toBeNull();
  });

  it("grants paid access from the account override without a payment period", async () => {
    mocks.userRows = [{ hasBillingOverride: true }];

    await expect(getPaidAccess("user-1")).resolves.toEqual({
      hasBillingOverride: true,
      subscription: null,
    });
  });

  it("returns effective paid access and the billing override in subscription details", async () => {
    mocks.userRows = [
      { hasActiveSubscription: false, hasBillingOverride: true },
    ];

    await expect(getSubscriptionDetails("user-1")).resolves.toEqual({
      hasActiveSubscription: false,
      hasBillingOverride: true,
      hasPaidAccess: true,
      subscriptionStart: undefined,
      subscriptionEnd: undefined,
    });
  });

  it("resolves valid API keys once and returns null for missing keys", async () => {
    mocks.selectRows = [{ user_id: "user-1" }];
    await expect(getUserIdForApiKey("customer-key")).resolves.toBe("user-1");
    expect(mocks.encryptDeterministic).toHaveBeenCalledWith("customer-key");

    mocks.selectRows = [];
    await expect(getUserIdForApiKey("missing-key")).resolves.toBeNull();
  });

  it("records an event below the configured threshold", async () => {
    mocks.selectRows = [{ value: 1 }];
    await expect(
      checkAndRecordRateLimit("user-1", {
        eventType: "event",
        maxRequests: 2,
        windowMs: 1000,
      }),
    ).resolves.toEqual({ allowed: true });
    expect(mocks.insertValues).toHaveBeenCalledOnce();
  });

  it("rejects at the threshold without recording another event", async () => {
    mocks.selectRows = [{ value: 2 }];
    await expect(
      checkAndRecordRateLimit("user-1", {
        eventType: "event",
        maxRequests: 2,
        windowMs: 1000,
      }),
    ).resolves.toEqual({ allowed: false, retryAfterSeconds: 1 });
    expect(mocks.insertValues).not.toHaveBeenCalled();
  });

  it("fails open when rate-limit persistence is unavailable", async () => {
    mocks.selectError = new Error("database unavailable");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(
      checkAndRecordRateLimit("user-1", {
        eventType: "event",
        maxRequests: 2,
        windowMs: 1000,
      }),
    ).resolves.toEqual({ allowed: true });
  });
});
