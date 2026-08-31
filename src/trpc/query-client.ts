import {
  defaultShouldDehydrateQuery,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

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
