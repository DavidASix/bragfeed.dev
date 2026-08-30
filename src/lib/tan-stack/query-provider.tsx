"use client";

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { toast } from "sonner";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import { TRPCProvider } from "@/lib/trpc/client";
import type { AppRouter } from "@/server/trpc/routers";

function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        console.error("Query error:", error);
        const message =
          query?.meta?.errorMessage ?? error.message ?? "An error occurred";
        toast.error(`Something went wrong: ${message}`);
      },
    }),
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(createQueryClient);
  const [trpcClient] = React.useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: "/api/trpc",
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <ReactQueryDevtools />
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
