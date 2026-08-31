import { TRPCError } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const { getActiveSubscription } = vi.hoisted(() => ({
  getActiveSubscription: vi.fn(),
}));

vi.mock("@/lib/server/subscriptions", () => ({ getActiveSubscription }));

import { paidProcedure, protectedProcedure, router } from "@/trpc";

const testRouter = router({
  protectedUser: protectedProcedure.query(({ ctx }) => ctx.userId),
  paidUser: paidProcedure.query(({ ctx }) => ({
    userId: ctx.userId,
    subscription: ctx.subscription,
  })),
  validatedMutation: protectedProcedure
    .input(z.object({ value: z.number().int().positive() }))
    .mutation(({ input }) => ({ doubled: input.value * 2 })),
  date: protectedProcedure.query(() => ({
    createdAt: new Date("2026-01-02T03:04:05.000Z"),
  })),
});

const authenticatedContext = {
  session: {
    expires: "2099-01-01T00:00:00.000Z",
    user: { id: "user-1" },
  },
};

describe("tRPC policy procedures", () => {
  beforeEach(() => {
    getActiveSubscription.mockReset();
  });

  it("rejects a protected procedure without a session", async () => {
    const caller = testRouter.createCaller({ session: null });
    await expect(caller.protectedUser()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("passes the authenticated user ID to a protected resolver", async () => {
    const caller = testRouter.createCaller(authenticatedContext);
    await expect(caller.protectedUser()).resolves.toBe("user-1");
  });

  it("rejects paid access without an active subscription", async () => {
    getActiveSubscription.mockResolvedValue(null);
    const caller = testRouter.createCaller(authenticatedContext);
    await expect(caller.paidUser()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("exposes an active subscription to a paid resolver", async () => {
    const subscription = {
      id: 1,
      subscriptionStart: new Date("2026-01-01T00:00:00.000Z"),
      subscriptionEnd: new Date("2027-01-01T00:00:00.000Z"),
    };
    getActiveSubscription.mockResolvedValue(subscription);
    const caller = testRouter.createCaller(authenticatedContext);
    await expect(caller.paidUser()).resolves.toEqual({
      userId: "user-1",
      subscription,
    });
  });

  it("validates mutation input and returns its inferred result", async () => {
    const caller = testRouter.createCaller(authenticatedContext);
    await expect(caller.validatedMutation({ value: 3 })).resolves.toEqual({
      doubled: 6,
    });
    await expect(
      caller.validatedMutation({ value: -1 }),
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("round-trips dates through the configured SuperJSON transport", async () => {
    const client = createTRPCClient<typeof testRouter>({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: "http://localhost/trpc",
          fetch: (input, init) =>
            fetchRequestHandler({
              endpoint: "/trpc",
              req: new Request(input, init),
              router: testRouter,
              createContext: () => authenticatedContext,
            }),
        }),
      ],
    });
    const result = await client.date.query();
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.createdAt.toISOString()).toBe("2026-01-02T03:04:05.000Z");
  });
});
