import { TRPCClientError } from "@trpc/client";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";
import { describe, expect, it } from "vitest";

import { shouldRetryQuery } from "@/trpc/query-client";
import type { AppRouter } from "@/trpc/routers";

/** Creates a typed tRPC client error with the code used by the retry policy. */
function createTrpcError(code: "UNAUTHORIZED" | "FORBIDDEN") {
  return TRPCClientError.from<AppRouter>({
    error: {
      code: TRPC_ERROR_CODES_BY_KEY[code],
      message: "Access denied",
      data: { code },
    },
  });
}

describe("shouldRetryQuery", () => {
  it.each(["UNAUTHORIZED", "FORBIDDEN"] as const)(
    "does not retry %s errors",
    (code) => {
      expect(shouldRetryQuery(0, createTrpcError(code))).toBe(false);
    },
  );

  it("retries other failures only once", () => {
    expect(shouldRetryQuery(0, new Error("Temporary failure"))).toBe(true);
    expect(shouldRetryQuery(1, new Error("Temporary failure"))).toBe(false);
  });
});
