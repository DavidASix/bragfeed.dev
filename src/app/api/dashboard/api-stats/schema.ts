import { z } from "zod";
import type { APISchema } from "@/schema/types";
import { stringDate } from "@/schema/types";

const schema = {
  url: "/api/dashboard/api-stats",
  request: z.undefined(),
  response: z.object({
    totalApiCalls: z.number(),
    monthlyApiCalls: z.number(),
    dailyAverageApiCalls: z.number(),
    latestApiCall: z
      .object({
        timestamp: stringDate,
        businessName: z.string().nullable(),
      })
      .nullable(),
  }),
} satisfies APISchema;

export default schema;
