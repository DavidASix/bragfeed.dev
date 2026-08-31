import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createTRPCContext } from "@/trpc/context";
import { appRouter } from "@/trpc/routers";

/**
 * Adapts Next.js requests to the application's single tRPC router.
 *
 * @param request - Incoming request for a tRPC query or mutation.
 * @returns The fetch response produced by tRPC.
 */
function handler(request: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: createTRPCContext,
    onError: ({ error, path }) => {
      if (process.env.NODE_ENV === "development") {
        console.error(`tRPC error on ${path ?? "unknown procedure"}:`, error);
      }
    },
  });
}

export { handler as GET, handler as POST };
