import {
  defaultShouldDehydrateQuery,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { isTRPCClientError } from "@trpc/client";
import superjson from "superjson";

import type { AppRouter } from "@/trpc/routers";

/**
 * Retries a transient query failure once while avoiding retries that cannot repair access.
 *
 * @param failureCount - Number of retries already attempted for the query.
 * @param error - Error returned by the query, including typed tRPC client errors.
 * @returns Whether TanStack Query should make another attempt.
 */
export function shouldRetryQuery(failureCount: number, error: unknown) {
  if (
    isTRPCClientError<AppRouter>(error) &&
    (error.data?.code === "FORBIDDEN" || error.data?.code === "UNAUTHORIZED")
  ) {
    return false;
  }

  return failureCount < 1;
}

/**
 * Creates a query client whose cache can cross the server/client boundary without losing SuperJSON values.
 *
 * @param queryCache - Optional cache used to attach browser-only error handling.
 * @returns A query client configured for tRPC hydration.
 */
export function createQueryClient(queryCache = new QueryCache()) {
  return new QueryClient({
    queryCache,
    defaultOptions: {
      queries: {
        retry: shouldRetryQuery,
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}
