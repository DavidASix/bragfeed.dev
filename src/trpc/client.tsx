"use client";

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import React from "react";
import { toast } from "sonner";
import superjson from "superjson";

import type { AppRouter } from "@/trpc/routers";

export const api = createTRPCReact<AppRouter>();

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
    api.createClient({
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
      <api.Provider client={trpcClient} queryClient={queryClient}>
        <ReactQueryDevtools />
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
}
