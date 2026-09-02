import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import { getActiveSubscription } from "@/lib/server/subscriptions";
import type { TRPCContext } from "./context";

const t = initTRPC.context<TRPCContext>().create({ transformer: superjson });

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const userId = ctx.session?.user?.id;
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { ...ctx, userId } });
});

export const paidProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const subscription = await getActiveSubscription(ctx.userId);
  if (!subscription) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({ ctx: { ...ctx, subscription } });
});
