import { createCallerFactory, router } from "..";
import { dashboardRouter } from "./dashboard";
import { googleRouter } from "./google";
import { purchasesRouter } from "./purchases";
import { securityRouter } from "./security";

export const appRouter = router({
  dashboard: dashboardRouter,
  google: googleRouter,
  purchases: purchasesRouter,
  security: securityRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
