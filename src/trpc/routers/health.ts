import { desc, sql } from "drizzle-orm";

import GoogleReviews from "@/google-reviews";
import { db } from "@/schema/db";
import { health_checks, type DBHealthCheckService } from "@/schema/schema";
import { publicProcedure, router } from "..";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
// UniClaw in Waterloo, Ontario is a fixed public business that keeps the provider check independent of customer data.
const HEALTH_CHECK_PLACE_ID = "ChIJZVJixfH1K4gRm44apfuxMRg";

type HealthCheckDefinition = {
  service: DBHealthCheckService;
  name: string;
  description: string;
  maxAgeMs: number;
  cadence: string;
  failureMessage: string;
  check: () => Promise<string>;
};

/** Verifies that the application can execute a query against its primary database. */
async function checkDatabase(): Promise<string> {
  await db.execute(sql`select 1`);
  return "Connected successfully.";
}

/** Verifies that Local Business Data returns business stats matching the expected API contract. */
async function checkLocalBusinessData(): Promise<string> {
  const googleReviews = new GoogleReviews(HEALTH_CHECK_PLACE_ID);
  await googleReviews.getStats();
  return "Fetched business data successfully.";
}

const healthCheckRegistry = [
  {
    service: "database",
    name: "Database",
    description: "Primary application database",
    maxAgeMs: 15 * MINUTE,
    cadence: "Every 15 minutes",
    failureMessage: "Could not connect to the database.",
    check: checkDatabase,
  },
  {
    service: "local-business-data",
    name: "Local Business Data",
    description: "Google business data provider",
    maxAgeMs: DAY,
    cadence: "Every 24 hours",
    failureMessage: "Could not reach the Local Business Data API.",
    check: checkLocalBusinessData,
  },
] satisfies readonly HealthCheckDefinition[];

type StoredHealthCheck = Pick<
  typeof health_checks.$inferSelect,
  "service" | "healthy" | "message" | "checked_at"
>;

/** Runs one registered service check and converts thrown errors into a persistable unhealthy result. */
async function runHealthCheck(
  definition: HealthCheckDefinition,
): Promise<StoredHealthCheck> {
  const checkedAt = new Date();

  try {
    const message = await definition.check();
    return {
      service: definition.service,
      healthy: true,
      message,
      checked_at: checkedAt,
    };
  } catch (error: unknown) {
    console.error(`Health check failed for ${definition.service}:`, error);
    return {
      service: definition.service,
      healthy: false,
      message: definition.failureMessage,
      checked_at: checkedAt,
    };
  }
}

export const healthRouter = router({
  /** Returns the latest service statuses, refreshing and persisting checks whose configured cache has expired. */
  getStatus: publicProcedure.query(async () => {
    let latestChecks: StoredHealthCheck[] = [];
    let canPersistResults = true;

    try {
      latestChecks = await db
        .selectDistinctOn([health_checks.service], {
          service: health_checks.service,
          healthy: health_checks.healthy,
          message: health_checks.message,
          checked_at: health_checks.checked_at,
        })
        .from(health_checks)
        .orderBy(health_checks.service, desc(health_checks.checked_at));
    } catch (error: unknown) {
      canPersistResults = false;
      console.error("Could not load cached health checks:", error);
    }

    const latestByService = new Map(
      latestChecks.map((check) => [check.service, check]),
    );
    const now = Date.now();

    const results = await Promise.all(
      healthCheckRegistry.map(async (definition) => {
        const cached = latestByService.get(definition.service);
        const isFresh =
          cached !== undefined &&
          now - cached.checked_at.getTime() < definition.maxAgeMs;
        const result = isFresh ? cached : await runHealthCheck(definition);

        return { definition, result, isFresh };
      }),
    );

    const newResults = results
      .filter(({ isFresh }) => !isFresh)
      .map(({ result }) => result);

    if (canPersistResults && newResults.length > 0) {
      try {
        await db.insert(health_checks).values(newResults);
      } catch (error: unknown) {
        console.error("Could not persist health check results:", error);
      }
    }

    const services = results.map(({ definition, result }) => ({
      service: definition.service,
      name: definition.name,
      description: definition.description,
      cadence: definition.cadence,
      healthy: result.healthy,
      message: result.message,
      checkedAt: result.checked_at,
    }));

    return {
      healthy: services.every((service) => service.healthy),
      services,
    };
  }),
});
