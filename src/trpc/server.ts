import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";

import { createTRPCContext } from "@/trpc/context";
import { createQueryClient } from "@/trpc/query-client";
import { createCaller, type AppRouter } from "@/trpc/routers";

const createContext = cache(createTRPCContext);
const caller = createCaller(createContext);
const getQueryClient = cache(createQueryClient);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
