import { z } from "zod";
import type { APISchema } from "@/schema/types";

const schema = {
  url: "/api/google/fetch-business-stats",
  request: z.object({
    business_id: z.string().uuid(),
  }),
  response: z.object({
    review_count: z.number().nullable(),
    review_score: z.number().nullable(),
  }),
} satisfies APISchema;

export default schema;
