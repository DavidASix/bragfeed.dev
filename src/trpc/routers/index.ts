import { createCallerFactory, router } from "..";
import { dashboardRouter } from "./dashboard";
import { googleRouter } from "./google";
import { healthRouter } from "./health";
import { purchasesRouter } from "./purchases";
import { securityRouter } from "./security";

export const appRouter = router({
  dashboard: dashboardRouter,
  google: googleRouter,
  health: healthRouter,
  purchases: purchasesRouter,
  security: securityRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
